// Fades: batch fades for LUNA. Fade-ins, fade-outs and crossfades on every
// audio clip of the selected tracks within the selection (or the whole track when there is no
// range), in one go. Clips that touch get a crossfade; free edges get a fade-in or fade-out.
// The window: a strip with both clips and every fade on them (draggable), and three cards,
// what to do (create new, adjust shape, adjust length) and length; a preset menu (built-in and your own) and Compare.

(() => {
  const $ = (id) => document.getElementById(id);
  const VERSION = '1.0.0';
  const KEY = 'com.fedetrillo.fades.';
  const store = {
    get: (k) => { try { return JSON.parse(localStorage.getItem(KEY + k)); } catch { return null; } },
    set: (k, v) => { try { localStorage.setItem(KEY + k, JSON.stringify(v)); } catch { /* not fatal */ } },
  };
  const I18N = {
    es: { _name: 'Español', presets: 'Presets:', factory: 'Valores de fábrica', compare: 'Comparar', fin: 'Fundido de entrada', xf: 'Fundido cruzado', fout: 'Fundido de salida',
      shape: 'Forma', placement: 'Colocación', linear: 'Lineal', equal_power: 'Potencia igual', log: 'Log', before: 'Antes del corte', center: 'Centrado', after: 'Después del corte',
      opIn: 'Operación de entrada', opX: 'Operación de cruzado', opOut: 'Operación de salida', createIn: 'Crear entradas nuevas', createX: 'Crear cruzados nuevos', createOut: 'Crear salidas nuevas',
      adjShape: 'Ajustar la forma de los que hay', adjLen: 'Ajustar la duración de los que hay', length: 'Duración:',
      slotTip: 'Clic: cargar · Alt+clic: guardar aquí los ajustes actuales', compareTip: 'Alterna entre tus cambios y el preset cargado',
      apply: 'Aplicar', remove: 'Quitar fundidos', undo: 'Deshacer', target: '<b>{n} clips</b> en {t} · {where}', range: '{from} → {to}', wholeTracks: 'pistas enteras',
      noTarget: 'Selecciona pistas de audio en LUNA y, si quieres, un rango.', working: 'Aplicando {i} de {n}…', done: '{fin} entradas · {xf} cruzados · {fout} salidas', removed: 'Quitados {n} fundidos',
      nothing: 'Nada que cambiar con estas opciones', failed: 'Error: {e}', undone: 'Deshecho', saved: 'Preset {n} guardado', loaded: 'Preset: {name}', waiting: 'Esperando a LUNA…', noSession: 'Abre una sesión en LUNA.', report: 'Informe copiado', dark: 'Oscuro', grey: 'Gris',
      voice: 'Voz', drums: 'Batería', dialog: 'Diálogo', soft: 'Suave', tight: 'Mínimo', applyTo: 'Aplicar a', newOnes: 'Nuevos', theirShape: 'Forma', theirLen: 'Duración', linearS: 'Lineal', equal_powerS: 'Pot. igual', logS: 'Log', beforeS: 'Antes', centerS: 'Centro', afterS: 'Después', applyTip: 'Nuevos: crea fundidos donde no hay · Forma y Duración: cambian las de los fundidos que ya existen', factoryGroup: 'De fábrica', mine: 'Mis presets', saveAs: 'Guardar preset…', deleteP: 'Borrar «{n}»', namePh: 'Nombre del preset', saveBtn: 'Guardar', cancel: 'Cancelar', savedP: 'Preset «{n}» guardado', deleted: 'Preset «{n}» borrado' },
    en: { _name: 'English', presets: 'Presets:', factory: 'Factory default', compare: 'Compare', fin: 'Fade In', xf: 'Crossfade', fout: 'Fade Out',
      shape: 'Shape', placement: 'Placement', linear: 'Linear', equal_power: 'Equal power', log: 'Log', before: 'Pre-splice', center: 'Centered', after: 'Post-splice',
      opIn: 'Fade In Operation', opX: 'Crossfade Operation', opOut: 'Fade Out Operation', createIn: 'Create new fade ins', createX: 'Create new crossfades', createOut: 'Create new fade outs',
      adjShape: 'Adjust existing shape', adjLen: 'Adjust existing length', length: 'Length:',
      slotTip: 'Click: load · Alt-click: save the current settings here', compareTip: 'Switches between your changes and the loaded preset',
      apply: 'Apply', remove: 'Remove fades', undo: 'Undo', target: '<b>{n} clips</b> on {t} · {where}', range: '{from} → {to}', wholeTracks: 'whole tracks',
      noTarget: 'Select audio tracks in LUNA and, if you like, a range.', working: 'Applying {i} of {n}…', done: '{fin} fade ins · {xf} crossfades · {fout} fade outs', removed: 'Removed {n} fades',
      nothing: 'Nothing to change with these options', failed: 'Error: {e}', undone: 'Undone', saved: 'Preset {n} saved', loaded: 'Preset: {name}', waiting: 'Waiting for LUNA…', noSession: 'Open a session in LUNA.', report: 'Report copied', dark: 'Dark', grey: 'Grey',
      voice: 'Vocal', drums: 'Drums', dialog: 'Dialog', soft: 'Soft', tight: 'Minimal', applyTo: 'Apply to', newOnes: 'New', theirShape: 'Shape', theirLen: 'Length', linearS: 'Linear', equal_powerS: 'Eq. power', logS: 'Log', beforeS: 'Before', centerS: 'Centre', afterS: 'After', applyTip: 'New: makes fades where there are none · Shape and Length: change those of fades that already exist', factoryGroup: 'Factory', mine: 'My presets', saveAs: 'Save preset…', deleteP: 'Delete "{n}"', namePh: 'Preset name', saveBtn: 'Save', cancel: 'Cancel', savedP: 'Preset "{n}" saved', deleted: 'Preset "{n}" deleted' },
    ca: { _name: 'Català', presets: 'Presets:', factory: 'Valors de fàbrica', compare: 'Comparar', fin: 'Fos d’entrada', xf: 'Fos encreuat', fout: 'Fos de sortida', shape: 'Forma', placement: 'Col·locació', linear: 'Lineal', equal_power: 'Potència igual', log: 'Log', before: 'Abans del tall', center: 'Centrat', after: 'Després del tall', createIn: 'Crear entrades noves', createX: 'Crear encreuats nous', createOut: 'Crear sortides noves', adjShape: 'Ajustar la forma dels que hi ha', adjLen: 'Ajustar la durada dels que hi ha', compareTip: 'Alterna entre els teus canvis i el preset carregat', apply: 'Aplicar', remove: 'Treure fosos', undo: 'Desfer', target: '<b>{n} clips</b> a {t} · {where}', range: '{from} → {to}', wholeTracks: 'pistes senceres', noTarget: 'Selecciona pistes d’àudio a LUNA i, si vols, un rang.', working: 'Aplicant {i} de {n}…', done: '{fin} entrades · {xf} encreuats · {fout} sortides', removed: 'Trets {n} fosos', nothing: 'No hi ha res per canviar amb aquestes opcions', failed: 'Error: {e}', undone: 'Desfet', loaded: 'Preset: {name}', waiting: 'Esperant LUNA…', noSession: 'Obre una sessió a LUNA.', report: 'Informe copiat', dark: 'Fosc', grey: 'Gris', voice: 'Veu', drums: 'Bateria', dialog: 'Diàleg', soft: 'Suau', tight: 'Mínim', applyTo: 'Aplicar a', newOnes: 'Nous', theirShape: 'Forma', theirLen: 'Durada', linearS: 'Lineal', equal_powerS: 'Pot. igual', logS: 'Log', beforeS: 'Abans', centerS: 'Centre', afterS: 'Després', applyTip: 'Nous: crea fosos on no n’hi ha · Forma i Durada: canvien les dels fosos que ja existeixen', factoryGroup: 'De fàbrica', mine: 'Els meus presets', saveAs: 'Desar preset…', deleteP: 'Esborrar «{n}»', namePh: 'Nom del preset', saveBtn: 'Desar', cancel: 'Cancel·lar', savedP: 'Preset «{n}» desat', deleted: 'Preset «{n}» esborrat' },
    fr: { _name: 'Français', presets: 'Presets :', factory: 'Réglages d’usine', compare: 'Comparer', fin: 'Fondu d’entrée', xf: 'Fondu enchaîné', fout: 'Fondu de sortie', shape: 'Forme', placement: 'Placement', linear: 'Linéaire', equal_power: 'Puissance égale', log: 'Log', before: 'Avant la coupe', center: 'Centré', after: 'Après la coupe', createIn: 'Créer de nouvelles entrées', createX: 'Créer de nouveaux enchaînés', createOut: 'Créer de nouvelles sorties', adjShape: 'Ajuster la forme des existants', adjLen: 'Ajuster la durée des existants', compareTip: 'Alterne entre vos changements et le preset chargé', apply: 'Appliquer', remove: 'Retirer les fondus', undo: 'Annuler', target: '<b>{n} clips</b> sur {t} · {where}', range: '{from} → {to}', wholeTracks: 'pistes entières', noTarget: 'Sélectionnez des pistes audio dans LUNA et, si vous voulez, une plage.', working: 'Application {i} sur {n}…', done: '{fin} entrées · {xf} enchaînés · {fout} sorties', removed: '{n} fondus retirés', nothing: 'Rien à changer avec ces options', failed: 'Erreur : {e}', undone: 'Annulé', loaded: 'Preset : {name}', waiting: 'En attente de LUNA…', noSession: 'Ouvrez une session dans LUNA.', report: 'Rapport copié', dark: 'Sombre', grey: 'Gris', voice: 'Voix', drums: 'Batterie', dialog: 'Dialogue', soft: 'Doux', tight: 'Minimal', applyTo: 'Appliquer à', newOnes: 'Nouveaux', theirShape: 'Forme', theirLen: 'Durée', linearS: 'Linéaire', equal_powerS: 'Puiss. égale', logS: 'Log', beforeS: 'Avant', centerS: 'Centre', afterS: 'Après', applyTip: 'Nouveaux : crée des fondus là où il n’y en a pas · Forme et Durée : changent celles des fondus existants', factoryGroup: 'Usine', mine: 'Mes presets', saveAs: 'Enregistrer le preset…', deleteP: 'Supprimer « {n} »', namePh: 'Nom du preset', saveBtn: 'Enregistrer', cancel: 'Annuler', savedP: 'Preset « {n} » enregistré', deleted: 'Preset « {n} » supprimé' },
    de: { _name: 'Deutsch', presets: 'Presets:', factory: 'Werkseinstellung', compare: 'Vergleichen', fin: 'Einblendung', xf: 'Überblendung', fout: 'Ausblendung', shape: 'Form', placement: 'Lage', linear: 'Linear', equal_power: 'Gleiche Leistung', log: 'Log', before: 'Vor dem Schnitt', center: 'Mittig', after: 'Nach dem Schnitt', createIn: 'Neue Einblendungen anlegen', createX: 'Neue Überblendungen anlegen', createOut: 'Neue Ausblendungen anlegen', adjShape: 'Form vorhandener anpassen', adjLen: 'Länge vorhandener anpassen', compareTip: 'Wechselt zwischen deinen Änderungen und dem geladenen Preset', apply: 'Anwenden', remove: 'Blenden entfernen', undo: 'Rückgängig', target: '<b>{n} Clips</b> auf {t} · {where}', range: '{from} → {to}', wholeTracks: 'ganze Spuren', noTarget: 'Wähle in LUNA Audiospuren und auf Wunsch einen Bereich.', working: 'Wende an: {i} von {n}…', done: '{fin} Einblendungen · {xf} Überblendungen · {fout} Ausblendungen', removed: '{n} Blenden entfernt', nothing: 'Mit diesen Optionen gibt es nichts zu ändern', failed: 'Fehler: {e}', undone: 'Rückgängig gemacht', loaded: 'Preset: {name}', waiting: 'Warte auf LUNA…', noSession: 'Öffne eine Session in LUNA.', report: 'Bericht kopiert', dark: 'Dunkel', grey: 'Grau', voice: 'Gesang', drums: 'Drums', dialog: 'Dialog', soft: 'Weich', tight: 'Minimal', applyTo: 'Anwenden auf', newOnes: 'Neue', theirShape: 'Form', theirLen: 'Länge', linearS: 'Linear', equal_powerS: 'Gl. Leistung', logS: 'Log', beforeS: 'Vor', centerS: 'Mitte', afterS: 'Nach', applyTip: 'Neue: legt Blenden an, wo keine sind · Form und Länge: ändern die vorhandener Blenden', factoryGroup: 'Werk', mine: 'Meine Presets', saveAs: 'Preset sichern…', deleteP: '„{n}“ löschen', namePh: 'Name des Presets', saveBtn: 'Sichern', cancel: 'Abbrechen', savedP: 'Preset „{n}“ gesichert', deleted: 'Preset „{n}“ gelöscht' },
    it: { _name: 'Italiano', presets: 'Preset:', factory: 'Valori di fabbrica', compare: 'Confronta', fin: 'Dissolvenza in entrata', xf: 'Dissolvenza incrociata', fout: 'Dissolvenza in uscita', shape: 'Forma', placement: 'Posizione', linear: 'Lineare', equal_power: 'Potenza uguale', log: 'Log', before: 'Prima del taglio', center: 'Centrata', after: 'Dopo il taglio', createIn: 'Crea nuove entrate', createX: 'Crea nuove incrociate', createOut: 'Crea nuove uscite', adjShape: 'Regola la forma di quelle esistenti', adjLen: 'Regola la durata di quelle esistenti', compareTip: 'Alterna tra le tue modifiche e il preset caricato', apply: 'Applica', remove: 'Togli dissolvenze', undo: 'Annulla', target: '<b>{n} clip</b> su {t} · {where}', range: '{from} → {to}', wholeTracks: 'tracce intere', noTarget: 'Seleziona tracce audio in LUNA e, se vuoi, un intervallo.', working: 'Applico {i} di {n}…', done: '{fin} entrate · {xf} incrociate · {fout} uscite', removed: 'Tolte {n} dissolvenze', nothing: 'Niente da cambiare con queste opzioni', failed: 'Errore: {e}', undone: 'Annullato', loaded: 'Preset: {name}', waiting: 'In attesa di LUNA…', noSession: 'Apri una sessione in LUNA.', report: 'Rapporto copiato', dark: 'Scuro', grey: 'Grigio', voice: 'Voce', drums: 'Batteria', dialog: 'Dialogo', soft: 'Morbido', tight: 'Minimo', applyTo: 'Applica a', newOnes: 'Nuove', theirShape: 'Forma', theirLen: 'Durata', linearS: 'Lineare', equal_powerS: 'Pot. uguale', logS: 'Log', beforeS: 'Prima', centerS: 'Centro', afterS: 'Dopo', applyTip: 'Nuove: crea dissolvenze dove non ce ne sono · Forma e Durata: cambiano quelle esistenti', factoryGroup: 'Di fabbrica', mine: 'I miei preset', saveAs: 'Salva preset…', deleteP: 'Elimina «{n}»', namePh: 'Nome del preset', saveBtn: 'Salva', cancel: 'Annulla', savedP: 'Preset «{n}» salvato', deleted: 'Preset «{n}» eliminato' },
    pt: { _name: 'Português', presets: 'Presets:', factory: 'Valores de fábrica', compare: 'Comparar', fin: 'Fade de entrada', xf: 'Crossfade', fout: 'Fade de saída', shape: 'Forma', placement: 'Posição', linear: 'Linear', equal_power: 'Potência igual', log: 'Log', before: 'Antes do corte', center: 'Centrado', after: 'Depois do corte', createIn: 'Criar entradas novas', createX: 'Criar crossfades novos', createOut: 'Criar saídas novas', adjShape: 'Ajustar a forma dos existentes', adjLen: 'Ajustar a duração dos existentes', compareTip: 'Alterna entre as tuas alterações e o preset carregado', apply: 'Aplicar', remove: 'Tirar fades', undo: 'Desfazer', target: '<b>{n} clips</b> em {t} · {where}', range: '{from} → {to}', wholeTracks: 'faixas inteiras', noTarget: 'Seleciona faixas de áudio no LUNA e, se quiseres, um intervalo.', working: 'A aplicar {i} de {n}…', done: '{fin} entradas · {xf} crossfades · {fout} saídas', removed: 'Tirados {n} fades', nothing: 'Nada para mudar com estas opções', failed: 'Erro: {e}', undone: 'Desfeito', loaded: 'Preset: {name}', waiting: 'À espera do LUNA…', noSession: 'Abre uma sessão no LUNA.', report: 'Relatório copiado', dark: 'Escuro', grey: 'Cinzento', voice: 'Voz', drums: 'Bateria', dialog: 'Diálogo', soft: 'Suave', tight: 'Mínimo', applyTo: 'Aplicar a', newOnes: 'Novos', theirShape: 'Forma', theirLen: 'Duração', linearS: 'Linear', equal_powerS: 'Pot. igual', logS: 'Log', beforeS: 'Antes', centerS: 'Centro', afterS: 'Depois', applyTip: 'Novos: cria fades onde não há · Forma e Duração: mudam as dos fades que já existem', factoryGroup: 'De fábrica', mine: 'Os meus presets', saveAs: 'Guardar preset…', deleteP: 'Apagar «{n}»', namePh: 'Nome do preset', saveBtn: 'Guardar', cancel: 'Cancelar', savedP: 'Preset «{n}» guardado', deleted: 'Preset «{n}» apagado' },
  };
  let lang = store.get('lang') ?? (() => { for (const l of navigator.languages ?? [navigator.language]) { const c = String(l || '').slice(0, 2).toLowerCase(); if (I18N[c]) return c; } return 'en'; })();
  const t = (k, v = {}) => String(I18N[lang][k] ?? I18N.en[k] ?? k).replace(/\{(\w+)\}/g, (m, x) => (x in v ? String(v[x]) : m));
  let theme = store.get('theme') === 'grey' ? 'grey' : 'dark';
  let statusTimer;
  const say = (key, vars = {}, kind = '', ms = 0) => { clearTimeout(statusTimer); $('status').textContent = key ? t(key, vars) : ''; $('status').className = `status ${kind}`; if (ms) statusTimer = setTimeout(() => say(null), ms); };
  const log = [];
  const note = (what, extra = {}) => { log.push({ t: new Date().toISOString().slice(11, 23), what, ...extra }); if (log.length > 300) log.shift(); };
  const errText = (e) => String(e?.message || e);

  // ---- Settings and presets -------------------------------------------------------------------
  const col = (ms, shape, extra = {}) => ({ ms, shape, create: true, adjShape: true, adjLen: true, ...extra });
  const FACTORY = { fin: col(10, 'log'), xf: col(10, 'equal_power', { align: 'center' }), fout: col(10, 'log') };
  const BUILTIN = {
    voice: { fin: col(5, 'log'), xf: col(8, 'equal_power', { align: 'center' }), fout: col(15, 'log') },
    drums: { fin: col(1, 'linear'), xf: col(2, 'equal_power', { align: 'before' }), fout: col(10, 'log') },
    dialog: { fin: col(10, 'equal_power'), xf: col(15, 'equal_power', { align: 'center' }), fout: col(25, 'equal_power') },
    soft: { fin: col(50, 'equal_power'), xf: col(50, 'equal_power', { align: 'center' }), fout: col(200, 'log') },
    tight: { fin: col(1, 'linear'), xf: col(1, 'linear', { align: 'center' }), fout: col(2, 'linear') },
  };
  const clone = (x) => JSON.parse(JSON.stringify(x));
  const settingsOf = (p) => ({ fin: clone(p.fin), xf: clone(p.xf), fout: clone(p.fout) });
  let opts = settingsOf(store.get('opts2') ?? FACTORY);
  const save = () => store.set('opts2', opts);
  const userPresets = store.get('userPresets') ?? [];   // [{ name, fin, xf, fout }]
  let loaded = store.get('loadedPreset') ?? 'b:factory'; // 'b:<key>' built in, 'u:<name>' yours
  let compareA = null;                                   // your edits while comparing
  const presetById = (id) => (id === 'b:factory' ? FACTORY : id.startsWith('b:') ? BUILTIN[id.slice(2)] : userPresets.find((p) => `u:${p.name}` === id)) ?? null;


  // ---- The strip: two clips with every fade on them, drawn to scale and draggable -------------
  // Gain from 0 to 1 over x in 0..1 for each LUNA shape.
  const gain = (shape, x) => (shape === 'linear' ? x : shape === 'equal_power' ? Math.sin((x * Math.PI) / 2) : 1 - Math.pow(1 - x, 3));
  // Fade length on screen: square-root scale, so 1 ms and 1 s both stay readable.
  const PX = 13, msToPx = (ms) => Math.max(10, Math.min(300, PX * Math.sqrt(ms))), pxToMs = (px) => Math.max(0.1, Math.round(Math.pow(Math.max(0, px) / PX, 2) * 10) / 10);
  const W = 880, H = 150, TOP = 26, BOT = H - 22;
  const curvePts = (shape, x0, x1, up) => { const p = []; for (let i = 0; i <= 36; i++) { const f = i / 36, g = gain(shape, up ? f : 1 - f); p.push([x0 + (x1 - x0) * f, BOT - g * (BOT - TOP)]); } return p; };
  const pathOf = (pts) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join('');
  function drawStrip() {
    const cut = W / 2, A0 = 16, B1 = W - 16;
    const fi = msToPx(opts.fin.ms), fo = msToPx(opts.fout.ms), xw = msToPx(opts.xf.ms);
    const sh = opts.xf.align === 'before' ? -xw / 2 : opts.xf.align === 'after' ? xw / 2 : 0;
    const xs = cut - xw / 2 + sh, xe = cut + xw / 2 + sh;
    const on = (k) => opts[k].create || opts[k].adjShape || opts[k].adjLen;
    const parts = [];
    // Clip bodies: A runs to the end of the crossfade, B starts at its start.
    parts.push(`<rect class="clip a" x="${A0}" y="${TOP - 10}" width="${(on('xf') ? xe : cut) - A0}" height="${BOT - TOP + 20}" rx="10"/>`);
    parts.push(`<rect class="clip b" x="${on('xf') ? xs : cut}" y="${TOP - 10}" width="${B1 - (on('xf') ? xs : cut)}" height="${BOT - TOP + 20}" rx="10"/>`);
    parts.push(`<text class="cl" x="${A0 + 12}" y="${BOT + 4}">A</text><text class="cl" x="${B1 - 20}" y="${BOT + 4}">B</text>`);
    const zone = (k, x0, x1, inner) => `<g class="zone ${k}${on(k) ? '' : ' off'}" data-k="${k}"><rect class="hot" x="${x0}" y="${TOP - 10}" width="${x1 - x0}" height="${BOT - TOP + 20}"/>${inner}</g>`;
    const fill = (pts, cls) => `<path class="fill ${cls}" d="${pathOf(pts)}L${pts.at(-1)[0]} ${BOT}L${pts[0][0]} ${BOT}Z"/><path class="curve ${cls}" d="${pathOf(pts)}"/>`;
    parts.push(zone('fin', A0, A0 + fi, fill(curvePts(opts.fin.shape, A0, A0 + fi, true), 'in')));
    parts.push(zone('fout', B1 - fo, B1, fill(curvePts(opts.fout.shape, B1 - fo, B1, false), 'out')));
    parts.push(zone('xf', xs, xe, `${fill(curvePts(opts.xf.shape, xs, xe, false), 'out')}${fill(curvePts(opts.xf.shape, xs, xe, true), 'in')}`));
    parts.push(`<line class="cut" x1="${cut}" x2="${cut}" y1="${TOP - 18}" y2="${BOT + 12}"/>`);
    // Handles to drag each fade's length.
    const handle = (k, x) => `<g class="handle${on(k) ? '' : ' off'}" data-k="${k}"><line x1="${x}" x2="${x}" y1="${TOP - 4}" y2="${BOT + 4}"/><circle cx="${x}" cy="${TOP - 4}" r="6"/></g>`;
    parts.push(handle('fin', A0 + fi), handle('fout', B1 - fo), handle('xf', opts.xf.align === 'before' ? xs : xe));
    const label = (x, txt, anchor = 'middle') => `<text class="ms" x="${x}" y="${TOP - 13}" text-anchor="${anchor}">${txt}</text>`;
    parts.push(label(Math.max(A0 + 22, A0 + fi / 2), `${opts.fin.ms} ms`), label(Math.min(B1 - 22, B1 - fo / 2), `${opts.fout.ms} ms`), label((xs + xe) / 2, `${opts.xf.ms} ms`));
    const svg = $('strip');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.innerHTML = parts.join('');
    for (const h of svg.querySelectorAll('.handle')) h.onpointerdown = (ev) => dragLen(ev, h.dataset.k);
    for (const z of svg.querySelectorAll('.zone')) z.onclick = () => focusCard(z.dataset.k);
  }
  function dragLen(ev, k) {
    ev.preventDefault();
    const svg = $('strip'), r = svg.getBoundingClientRect(), scale = W / r.width;
    const cut = W / 2, A0 = 16, B1 = W - 16;
    const move = (e) => {
      const x = (e.clientX - r.left) * scale;
      let px;
      if (k === 'fin') px = x - A0;
      else if (k === 'fout') px = B1 - x;
      else { const f = opts.xf.align === 'before' ? 0 : opts.xf.align === 'after' ? 1 : 0.5; px = f === 0 ? cut - x : (x - cut) / f; }
      opts[k].ms = Math.min(5000, pxToMs(Math.max(10, Math.min(300, px))));
      compareA = null; drawStrip(); paintCards(true);
    };
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); save(); paint(); };
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
  }

  // ---- The three cards ------------------------------------------------------------------------------
  const SHAPE_KEYS = ['linear', 'equal_power', 'log'];
  const placeIcon = (a) => { const x = a === 'before' ? 3 : a === 'after' ? 13 : 8; return `<svg viewBox="0 0 26 14"><rect x="${x}" y="2" width="10" height="10" rx="2" class="pf"/><line x1="13" x2="13" y1="0" y2="14" class="pc"/></svg>`; };
  let focused = null;
  function focusCard(k) { focused = k; for (const c of document.querySelectorAll('.card3')) c.classList.toggle('focus', c.dataset.k === k); }
  function card(k) {
    const o = opts[k];
    const c = document.createElement('section');
    c.className = `card3 ${k}${focused === k ? ' focus' : ''}${o.create || o.adjShape || o.adjLen ? '' : ' off'}`;
    c.dataset.k = k;
    c.innerHTML = `<header><i class="dot"></i><b></b><label class="num"><input type="text" inputmode="decimal"><span>ms</span></label></header><div class="field"><span class="fl"></span><div class="seg sh"></div></div>${k === 'xf' ? '<div class="field"><span class="fl pl"></span><div class="seg place"></div></div>' : ''}<div class="field"><span class="fl ap"></span><div class="chips"></div></div>`;
    c.querySelector('b').textContent = t(k);
    const inp = c.querySelector('input'); inp.value = String(o.ms);
    inp.onchange = () => { const v = Number(String(inp.value).replace(',', '.')); if (Number.isFinite(v) && v > 0) { o.ms = Math.min(5000, Math.round(v * 10) / 10); touched(); } else inp.value = String(o.ms); };
    inp.onkeydown = (e) => { if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); const step = e.shiftKey ? 10 : 1; o.ms = Math.max(0.1, Math.min(5000, Math.round((o.ms + (e.key === 'ArrowUp' ? step : -step)) * 10) / 10)); touched(); } };
    c.querySelector('.fl').textContent = t('shape');
    c.querySelector('.sh').replaceChildren(...SHAPE_KEYS.map((s) => { const b = document.createElement('button'); b.innerHTML = `${shapeIcon(s, k === 'fout')}<span></span>`; b.querySelector('span').textContent = t(s + 'S'); b.title = t(s); b.classList.toggle('on', o.shape === s); b.onclick = () => { o.shape = s; touched(); }; return b; }));
    if (k === 'xf') {
      c.querySelector('.pl').textContent = t('placement');
      c.querySelector('.place').replaceChildren(...['before', 'center', 'after'].map((a) => { const b = document.createElement('button'); b.innerHTML = `${placeIcon(a)}<span></span>`; b.querySelector('span').textContent = t(a + 'S'); b.title = t(a); b.classList.toggle('on', o.align === a); b.onclick = () => { o.align = a; touched(); }; return b; }));
    }
    c.querySelector('.ap').textContent = t('applyTo');
    c.querySelector('.ap').title = t('applyTip');
    c.querySelector('.chips').replaceChildren(...[['create', 'newOnes'], ['adjShape', 'theirShape'], ['adjLen', 'theirLen']].map(([f, lk]) => { const b = document.createElement('button'); b.className = `tog${o[f] ? ' on' : ''}`; b.textContent = t(lk); b.title = t(f === 'create' ? (k === 'fin' ? 'createIn' : k === 'xf' ? 'createX' : 'createOut') : f === 'adjShape' ? 'adjShape' : 'adjLen'); b.onclick = () => { o[f] = !o[f]; touched(); }; return b; }));
    c.onclick = () => focusCard(k);
    return c;
  }
  function paintCards(numbersOnly) {
    if (numbersOnly) { for (const c of document.querySelectorAll('.card3')) { const inp = c.querySelector('.num input'); if (document.activeElement !== inp) inp.value = String(opts[c.dataset.k].ms); } return; }
    $('cards').replaceChildren(card('fin'), card('xf'), card('fout'));
  }
  const shapeIcon = (s, down) => {
    const d = s === 'linear' ? 'M1 13L21 1' : s === 'log' ? 'M1 13C3 4 9 1 21 1' : 'M1 13C8 12 15 7 21 1';
    return `<svg viewBox="0 0 22 14"${down ? ' style="transform:scaleX(-1)"' : ''}><path d="${d}"/></svg>`;
  };
  const touched = () => { compareA = null; save(); paint(); };

  let repaint = () => {};
  function paint() {
    drawStrip();
    paintCards();
    paintPresets();
    $('compare').classList.toggle('on', !!compareA);
    $('compare').disabled = !presetById(loaded);
  }
  // The preset menu: built-in presets, yours, then save and delete.
  function paintPresets() {
    const sel = $('preset');
    const opt = (value, text) => Object.assign(document.createElement('option'), { value, textContent: text });
    const g1 = document.createElement('optgroup'); g1.label = t('factoryGroup');
    g1.append(opt('b:factory', t('factory')), ...Object.keys(BUILTIN).map((k) => opt(`b:${k}`, t(k))));
    const kids = [g1];
    if (userPresets.length) { const g2 = document.createElement('optgroup'); g2.label = t('mine'); g2.append(...userPresets.map((p) => opt(`u:${p.name}`, p.name))); kids.push(g2); }
    const g3 = document.createElement('optgroup'); g3.label = '—';
    g3.append(opt('save', t('saveAs')));
    if (loaded.startsWith('u:')) g3.append(opt('delete', t('deleteP', { n: loaded.slice(2) })));
    kids.push(g3);
    sel.replaceChildren(...kids);
    sel.value = presetById(loaded) ? loaded : '';
  }
  $('preset').onchange = () => {
    const v = $('preset').value;
    if (v === 'save') { $('saveBox').hidden = false; $('saveName').value = loaded.startsWith('u:') ? loaded.slice(2) : ''; $('saveName').placeholder = t('namePh'); $('saveName').focus(); paintPresets(); return; }
    if (v === 'delete') { const n = loaded.slice(2); const k = userPresets.findIndex((p) => p.name === n); if (k >= 0) userPresets.splice(k, 1); store.set('userPresets', userPresets); loaded = 'b:factory'; store.set('loadedPreset', loaded); say('deleted', { n }, 'ok', 2500); paint(); return; }
    const p = presetById(v);
    if (!p) return;
    opts = settingsOf(p); loaded = v; compareA = null; store.set('loadedPreset', v); save();
    say('loaded', { name: v.startsWith('u:') ? v.slice(2) : t(v.slice(2)) }, 'ok', 2500);
    paint();
  };
  const closeSave = () => { $('saveBox').hidden = true; };
  $('saveOk').onclick = () => {
    const n = $('saveName').value.trim();
    if (!n) return;
    const k = userPresets.findIndex((p) => p.name === n);
    const p = { name: n, ...settingsOf(opts) };
    if (k >= 0) userPresets[k] = p; else userPresets.push(p);
    userPresets.sort((a, b) => a.name.localeCompare(b.name));
    store.set('userPresets', userPresets);
    loaded = `u:${n}`; store.set('loadedPreset', loaded); compareA = null;
    closeSave(); say('savedP', { n }, 'ok', 2500); paint();
  };
  $('saveCancel').onclick = closeSave;
  $('saveName').onkeydown = (e) => { if (e.key === 'Enter') $('saveOk').click(); if (e.key === 'Escape') closeSave(); };
  $('compare').onclick = () => {
    const p = presetById(loaded);
    if (!p) return;
    if (!compareA) { compareA = settingsOf(opts); opts = settingsOf(p); }
    else { opts = compareA; compareA = null; }
    save(); paint();
  };
  function paintStatic() {
    document.documentElement.lang = lang;
    document.documentElement.dataset.theme = theme;
    $('ver').textContent = `v${VERSION}`;
    $('lang').replaceChildren(...Object.keys(I18N).map((c) => Object.assign(document.createElement('option'), { value: c, textContent: I18N[c]._name })));
    $('lang').value = lang;
    for (const [id, name] of [['tDark', 'dark'], ['tGrey', 'grey']]) { $(id).classList.toggle('on', theme === name); $(id).title = t(name); }
    for (const [id, k] of Object.entries({ presetsLabel: 'presets', compare: 'compare', saveOk: 'saveBtn', saveCancel: 'cancel', apply: 'apply', remove: 'remove', undo: 'undo' })) $(id).textContent = t(k);
    $('compare').title = t('compareTip');
    paint(); repaint();
  }
  $('lang').onchange = () => { lang = $('lang').value; store.set('lang', lang); paintStatic(); };
  for (const b of [$('tDark'), $('tGrey')]) b.onclick = () => { theme = b.dataset.t; store.set('theme', theme); paintStatic(); };
  paintStatic();

  let luna, built;
  async function build() {
    const s = luna.sessions.current();
    if (s === built) return;
    built = s;
    if (!s) { say('noSession'); return; }
    await s.ready();
    if (s !== built) return;
    await s.musical.ready();
    say(null);
    const tl = s.musical.timeline, ctx = s.context;
    let busy = false, undoSteps = 0;

    const msToTicks = (ms, at) => Math.max(1, Math.round(tl.tickAtSeconds(tl.seconds(at) + ms / 1000) - at));
    function selection() {
      const ids = ctx.selectionTracks.value ?? [];
      const tracks = ids.map((id) => s.tracks.byId(id)).filter((x) => x && x.trackType?.value === 'audio');
      const S = ctx.selectionStart.value, E = ctx.selectionStop.value;
      const range = typeof S === 'number' && typeof E === 'number' && E > S ? { S, E } : null;
      return { tracks, range };
    }
    // Every audio clip of the selected tracks in the range, what touches it, and its fades now.
    async function gather() {
      const { tracks, range } = selection();
      const jobs = [];
      for (const tk of tracks) {
        const lane = s.playlistFor(tk);
        if (!lane) continue;
        await lane.clips.load();
        await lane.compiledClips?.load?.().catch(() => undefined);
        const all = lane.clips.items.filter((c) => c.clipType?.value !== 'midi' && c.clipType?.value !== 'video').sort((a, b) => a.start.value - b.start.value);
        const inRange = (c) => !range || (c.stop.value > range.S && c.start.value < range.E);
        const fades = new Map();
        for (const seg of lane.compiledClips?.inOrder?.() ?? []) {
          const id = seg.clipUid.value; const f = fades.get(id) ?? {};
          const fi = seg.fadeIn.value, fo = seg.fadeOut.value;
          if (fi && !fi.crossfade) f.in = { len: fi.stop - fi.start, shape: fi.shape };
          if (fo && !fo.crossfade) f.out = { len: fo.stop - fo.start, shape: fo.shape };
          if (fo?.crossfade) f.xf = { len: fo.stop - fo.start, shape: fo.shape };
          fades.set(id, f);
        }
        const near = (a, b) => Math.abs(a - b) <= 2;
        for (const c of all.filter(inRange)) {
          const prev = all.find((p) => p !== c && near(p.stop.value, c.start.value) && p.layer.value === c.layer.value);
          const next = all.find((n) => n !== c && near(n.start.value, c.stop.value) && n.layer.value === c.layer.value);
          jobs.push({ lane, clip: c, prev, next: next && inRange(next) ? next : null, touchesNext: !!next, gap: next ? next.start.value - c.stop.value : null, has: fades.get(c.uid.value) ?? fades.get(c.id) ?? {} });
        }
      }
      return { jobs, tracks };
    }
    async function paintTarget() {
      const { tracks, range } = selection();
      const box = $('target');
      if (!tracks.length) { box.textContent = t('noTarget'); $('apply').disabled = $('remove').disabled = true; return; }
      let n = 0;
      for (const tk of tracks) { const lane = s.playlistFor(tk); if (!lane) continue; await lane.clips.load(); n += lane.clips.items.filter((c) => c.clipType?.value !== 'midi' && (!range || (c.stop.value > range.S && c.start.value < range.E))).length; }
      const names = tracks.map((x) => x.name.value.replace(/[<&]/g, '')).join(', ');
      box.innerHTML = t('target', { n, t: names, where: range ? t('range', { from: tl.formatBarBeat(range.S), to: tl.formatBarBeat(range.E) }) : t('wholeTracks') });
      $('apply').disabled = $('remove').disabled = busy || !n;
    }
    let paintTimer;
    repaint = () => { clearTimeout(paintTimer); paintTimer = setTimeout(() => void paintTarget(), 120); };

    // A crossfade straight through LUNA's set_fade, the way its own Batch Fades does it. LUNA
    // measures it from the edit it hears, so clips a tick or two apart are crossfaded too (the
    // SDK's helper insists on an exact join).
    async function crossfade(j, L, align, shape) {
      const [so, eo] = align === 'before' ? [-L, 0] : align === 'after' ? [0, L] : [-Math.floor(L / 2), L - Math.floor(L / 2)];
      const commands = `${s.path}/contexts/main/commands`;
      const reply = await luna.raw.post(`${commands}/set_fade`, {
        session_uid: s.uid, ...(shape ? { fade_shape: shape } : {}),
        clips: [{ playlist_uid: j.clip.playlistUid ?? j.lane.id, clip_uid: j.clip.id, contributor_clip_uid: j.next.id, fade_type: 'cross_fade', start_offset: so, stop_offset: eo, trim_to_edge: false, fade_reference_edge: 'none' }],
      });
      const res = reply?.edit_results ?? {};
      const changed = (res.changed?.fades ?? []).map((f) => f.fade_uid).filter((u) => typeof u === 'string');
      const added = (res.added?.fades ?? []).length;
      if (shape && changed.length) await luna.raw.post(`${commands}/change_fade_curvature`, { session_uid: s.uid, fades: changed, fade_shape: shape });
      note('crossfade', { clip: j.clip.name.value, next: j.next.name.value, gap: j.gap, L, added, changed: changed.length });
      return added + changed.length > 0;
    }
    // What to do with one fade, Pro Tools style: create where there is none; where there is one,
    // change its shape and/or its length as allowed. Returns [length, shape] or null.
    function plan(o, existing, wantLen) {
      if (!existing) return o.create ? [wantLen, o.shape] : null;
      if (!o.adjShape && !o.adjLen) return null;
      const len = o.adjLen ? wantLen : existing.len;
      const shape = o.adjShape ? o.shape : undefined;
      if (len === existing.len && (!shape || shape === existing.shape)) return null;
      return [len, shape];
    }
    async function apply() {
      if (busy) return;
      busy = true; repaint();
      let fin = 0, fout = 0, xf = 0, steps = 0;
      try {
        const { jobs } = await gather();
        note('pairs', { clips: jobs.length, touching: jobs.filter((j) => j.touchesNext).length, inRange: jobs.filter((j) => j.next).length, gaps: jobs.filter((j) => j.gap !== null).map((j) => j.gap).slice(0, 20) });
        let i = 0;
        for (const j of jobs) {
          i++; if (i % 5 === 0 || i === jobs.length) say('working', { i, n: jobs.length });
          const c = j.clip, len = c.stop.value - c.start.value;
          const cap = (ticks) => Math.max(1, Math.min(ticks, Math.floor(len * 0.45)));
          if (!j.prev) {
            const p = plan(opts.fin, j.has.in, cap(msToTicks(opts.fin.ms, c.start.value)));
            if (p) { await c.setFadeIn(p[0], p[1] ? { shape: p[1] } : {}); fin++; steps += j.has.in && p[1] && p[1] !== j.has.in.shape ? 2 : 1; }
          }
          if (!j.touchesNext) {
            const p = plan(opts.fout, j.has.out, cap(msToTicks(opts.fout.ms, c.stop.value)));
            if (p) { await c.setFadeOut(p[0], p[1] ? { shape: p[1] } : {}); fout++; steps += j.has.out && p[1] && p[1] !== j.has.out.shape ? 2 : 1; }
          }
          if (j.next) {
            const nlen = j.next.stop.value - j.next.start.value;
            const want = Math.max(1, Math.min(msToTicks(opts.xf.ms, c.stop.value), Math.floor(Math.min(len, nlen) * 0.45)));
            const p = plan(opts.xf, j.has.xf, want);
            if (p) {
              try { if (await crossfade(j, p[0], opts.xf.align, p[1])) { xf++; steps += j.has.xf && p[1] && p[1] !== j.has.xf.shape ? 2 : 1; } }
              catch (e) { note('crossfade failed', { clip: c.name.value, gap: j.gap, e: errText(e) }); }
            }
          }
        }
        undoSteps = steps;
        note('apply', { clips: jobs.length, fin, fout, xf, steps, opts });
        if (fin + fout + xf) say('done', { fin, fout, xf }, 'ok', 8000); else say('nothing', {}, '', 5000);
      } catch (e) {
        undoSteps = steps;
        note('apply failed', { e: errText(e) });
        say('failed', { e: errText(e) }, 'bad', 9000);
      }
      busy = false; repaint();
    }
    async function removeAll() {
      if (busy) return;
      busy = true; repaint();
      let n = 0;
      try {
        const { jobs } = await gather();
        for (const j of jobs) {
          if (j.has.in) { await j.clip.removeFadeIn(); n++; }
          if (j.has.out) { await j.clip.removeFadeOut(); n++; }
          if (j.has.xf && j.next) { await j.clip.removeCrossfade(j.next); n++; }
        }
        undoSteps = n;
        say('removed', { n }, 'ok', 5000);
      } catch (e) { note('remove failed', { e: errText(e) }); say('failed', { e: errText(e) }, 'bad', 9000); }
      busy = false; repaint();
    }
    $('apply').onclick = () => void apply();
    $('remove').onclick = () => void removeAll();
    $('undo').onclick = async () => { if (!undoSteps || busy) return; try { await s.undo(undoSteps); undoSteps = 0; say('undone', {}, 'ok', 3000); } catch (e) { say('failed', { e: errText(e) }, 'bad', 6000); } };
    $('ver').onclick = async (ev) => {
      if (!ev.altKey) return;
      const text = JSON.stringify({ version: VERSION, opts, selection: (() => { const x = selection(); return { tracks: x.tracks.map((k) => k.name.value), range: x.range }; })(), log }, null, 2);
      try { await navigator.clipboard.writeText(text); say('report', {}, 'ok', 2500); } catch { /* nothing */ }
    };
    for (const p of [ctx.selectionStart, ctx.selectionStop, ctx.selectionTracks]) p?.onChange?.(() => repaint());
    repaint();
  }

  (async () => {
    for (;;) {
      try { luna = await Luna.connect(); break; }
      catch { say('waiting'); await new Promise((r) => setTimeout(r, 1500)); }
    }
    Luna.bindShortcuts(luna, { onError: () => undefined });
    await luna.sessions.ready();
    luna.sessions.focused.onChange(() => void build());
    await build();
  })();
})();

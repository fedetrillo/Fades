// Fades: batch fades for LUNA. Fade-ins, fade-outs and crossfades on every
// audio clip of the selected tracks within the selection (or the whole track when there is no
// range), in one go. Clips that touch get a crossfade; free edges get a fade-in or fade-out.
// The window: a strip with both clips and every fade on them (draggable), and three cards,
// what to do (create new, adjust shape, adjust length) and length; a preset menu (built-in and your own) and Compare.

(() => {
  const $ = (id) => document.getElementById(id);
  const VERSION = '1.2.0';
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

  // Fades 1.1: live summary, one mode for fades already there, colours.
  for (const [c, v] of Object.entries({"en": {"modeLabel": "Fades already there:", "mNew": "Keep them, create new ones only", "mBoth": "Create new ones and adjust them", "mAdjust": "Only adjust them", "perType": "Choose per type…", "trk1": "1 track", "trkN": "{n} tracks", "clp1": "1 clip", "clpN": "{n} clips", "applyN": "Apply {n} fades", "apply1": "Apply 1 fade", "pIn": "fade-ins", "pXf": "crossfades", "pOut": "fade-outs", "rule": "No fade ever takes more than 45 % of its clip.", "noClips": "No audio clips in the selection.", "color": "Colour", "cYellow": "Yellow", "cOrange": "Orange", "cRed": "Red", "cGreen": "Green", "cBlue": "Blue", "cPink": "Pink", "cPurple": "Purple"}, "es": {"modeLabel": "Con los fundidos que ya hay:", "mNew": "Dejarlos y crear solo nuevos", "mBoth": "Crear nuevos y ajustar los que hay", "mAdjust": "Solo ajustar los que hay", "perType": "Elegir por tipo…", "trk1": "1 pista", "trkN": "{n} pistas", "clp1": "1 clip", "clpN": "{n} clips", "applyN": "Aplicar {n} fundidos", "apply1": "Aplicar 1 fundido", "pIn": "de entrada", "pXf": "cruzados", "pOut": "de salida", "rule": "Ningún fundido pasa del 45 % de su clip.", "noClips": "No hay clips de audio en la selección.", "color": "Color", "cYellow": "Amarillo", "cOrange": "Naranja", "cRed": "Rojo", "cGreen": "Verde", "cBlue": "Azul", "cPink": "Rosa", "cPurple": "Morado"}, "ca": {"modeLabel": "Amb els fosos que ja hi ha:", "mNew": "Deixar-los i crear-ne només de nous", "mBoth": "Crear-ne de nous i ajustar els que hi ha", "mAdjust": "Només ajustar els que hi ha", "perType": "Triar per tipus…", "trk1": "1 pista", "trkN": "{n} pistes", "clp1": "1 clip", "clpN": "{n} clips", "applyN": "Aplicar {n} fosos", "apply1": "Aplicar 1 fos", "pIn": "d’entrada", "pXf": "encreuats", "pOut": "de sortida", "rule": "Cap fos passa del 45 % del seu clip.", "noClips": "No hi ha clips d’àudio a la selecció.", "color": "Color", "cYellow": "Groc", "cOrange": "Taronja", "cRed": "Vermell", "cGreen": "Verd", "cBlue": "Blau", "cPink": "Rosa", "cPurple": "Morat"}, "fr": {"modeLabel": "Les fondus déjà présents :", "mNew": "Les garder, créer seulement les nouveaux", "mBoth": "Créer les nouveaux et ajuster les existants", "mAdjust": "Seulement ajuster les existants", "perType": "Choisir par type…", "trk1": "1 piste", "trkN": "{n} pistes", "clp1": "1 clip", "clpN": "{n} clips", "applyN": "Appliquer {n} fondus", "apply1": "Appliquer 1 fondu", "pIn": "d’entrée", "pXf": "enchaînés", "pOut": "de sortie", "rule": "Aucun fondu ne dépasse 45 % de son clip.", "noClips": "Aucun clip audio dans la sélection.", "color": "Couleur", "cYellow": "Jaune", "cOrange": "Orange", "cRed": "Rouge", "cGreen": "Vert", "cBlue": "Bleu", "cPink": "Rose", "cPurple": "Violet"}, "de": {"modeLabel": "Vorhandene Blenden:", "mNew": "Behalten, nur neue anlegen", "mBoth": "Neue anlegen und vorhandene anpassen", "mAdjust": "Nur vorhandene anpassen", "perType": "Pro Art wählen…", "trk1": "1 Spur", "trkN": "{n} Spuren", "clp1": "1 Clip", "clpN": "{n} Clips", "applyN": "{n} Blenden anwenden", "apply1": "1 Blende anwenden", "pIn": "Einblenden", "pXf": "Überblenden", "pOut": "Ausblenden", "rule": "Keine Blende nimmt mehr als 45 % ihres Clips ein.", "noClips": "Keine Audioclips in der Auswahl.", "color": "Farbe", "cYellow": "Gelb", "cOrange": "Orange", "cRed": "Rot", "cGreen": "Grün", "cBlue": "Blau", "cPink": "Pink", "cPurple": "Lila"}, "it": {"modeLabel": "Con le dissolvenze già presenti:", "mNew": "Lasciarle e crearne solo di nuove", "mBoth": "Crearne di nuove e regolare quelle presenti", "mAdjust": "Solo regolare quelle presenti", "perType": "Scegli per tipo…", "trk1": "1 traccia", "trkN": "{n} tracce", "clp1": "1 clip", "clpN": "{n} clip", "applyN": "Applica {n} dissolvenze", "apply1": "Applica 1 dissolvenza", "pIn": "in entrata", "pXf": "incrociate", "pOut": "in uscita", "rule": "Nessuna dissolvenza supera il 45 % della sua clip.", "noClips": "Nessuna clip audio nella selezione.", "color": "Colore", "cYellow": "Giallo", "cOrange": "Arancione", "cRed": "Rosso", "cGreen": "Verde", "cBlue": "Blu", "cPink": "Rosa", "cPurple": "Viola"}, "pt": {"modeLabel": "Com os fades que já existem:", "mNew": "Deixá-los e criar só novos", "mBoth": "Criar novos e ajustar os existentes", "mAdjust": "Só ajustar os existentes", "perType": "Escolher por tipo…", "trk1": "1 faixa", "trkN": "{n} faixas", "clp1": "1 clip", "clpN": "{n} clips", "applyN": "Aplicar {n} fades", "apply1": "Aplicar 1 fade", "pIn": "de entrada", "pXf": "cruzados", "pOut": "de saída", "rule": "Nenhum fade passa de 45 % do seu clip.", "noClips": "Não há clips de áudio na seleção.", "color": "Cor", "cYellow": "Amarelo", "cOrange": "Laranja", "cRed": "Vermelho", "cGreen": "Verde", "cBlue": "Azul", "cPink": "Rosa", "cPurple": "Roxo"}})) Object.assign(I18N[c], v);

  // The guide: its texts, in every language.
  for (const [c, v] of Object.entries({"en": {"help": "Quick guide", "helpBtn": "Guide", "tNext": "Next", "tBack": "Back", "tSkip": "Skip", "tDone": "Got it", "langT": "Choose your language", "langX": "The guide and the whole window will use it. You can change it later here, at the top right.", "zt": "Always at hand", "z": "Open this guide again whenever you need it with the Guide button.", "q1t": "Presets", "q1": "Vocal, Drums, Dialog, Soft and Minimal, plus your own. Compare switches between your changes and the loaded preset.", "q2t": "Each kind of fade", "q2": "Fade-ins, crossfades and fade-outs, drawn to scale: drag the lengths or type them in ms, pick the shape, and choose whether to create new fades or adjust the ones already there.", "q3t": "What it works on", "q3": "Select audio tracks in LUNA and, if you like, a range: every clip inside gets the right fade, never more than 45 % of a clip. Here you see how many fades Apply will make.", "q4t": "Apply", "q4": "Apply makes them all at once. Remove fades takes them out of the selection, and Undo reverts the last run."}, "es": {"help": "Guía rápida", "helpBtn": "Guía", "tNext": "Siguiente", "tBack": "Atrás", "tSkip": "Saltar", "tDone": "Entendido", "langT": "Elige tu idioma", "langX": "La guía y toda la ventana lo usarán. Puedes cambiarlo luego aquí, arriba a la derecha.", "zt": "Siempre a mano", "z": "Vuelve a esta guía cuando la necesites con el botón Guía.", "q1t": "Presets", "q1": "Voz, Batería, Diálogo, Suave y Mínimo, más los tuyos. Comparar alterna entre tus cambios y el preset cargado.", "q2t": "Cada tipo de fundido", "q2": "Fundidos de entrada, cruzados y de salida, dibujados a escala: arrastra las duraciones o escríbelas en ms, elige la forma y decide si crear fundidos nuevos o ajustar los que ya hay.", "q3t": "Sobre qué trabaja", "q3": "Selecciona pistas de audio en LUNA y, si quieres, un rango: cada clip de dentro recibe el fundido que le toca, nunca más del 45 % del clip. Aquí ves cuántos fundidos hará Aplicar.", "q4t": "Aplica", "q4": "Aplicar los hace todos a la vez. Quitar fundidos los saca de la selección y Deshacer revierte la última pasada."}, "ca": {"help": "Guia ràpida", "helpBtn": "Guia", "tNext": "Següent", "tBack": "Enrere", "tSkip": "Saltar", "tDone": "Entesos", "langT": "Tria el teu idioma", "langX": "La guia i tota la finestra el faran servir. El pots canviar després aquí, a dalt a la dreta.", "zt": "Sempre a mà", "z": "Torna a aquesta guia quan la necessitis amb el botó Guia.", "q1t": "Presets", "q1": "Veu, Bateria, Diàleg, Suau i Mínim, més els teus. Comparar alterna entre els teus canvis i el preset carregat.", "q2t": "Cada tipus de fos", "q2": "Fosos d’entrada, encreuats i de sortida, dibuixats a escala: arrossega les durades o escriu-les en ms, tria la forma i decideix si crear fosos nous o ajustar els que ja hi ha.", "q3t": "Sobre què treballa", "q3": "Selecciona pistes d’àudio a LUNA i, si vols, un rang: cada clip de dins rep el fos que li toca, mai més del 45 % del clip. Aquí veus quants fosos farà Aplicar.", "q4t": "Aplica", "q4": "Aplicar els fa tots alhora. Treure fosos els treu de la selecció i Desfer reverteix l’última passada."}, "fr": {"help": "Guide rapide", "helpBtn": "Guide", "tNext": "Suivant", "tBack": "Retour", "tSkip": "Passer", "tDone": "Compris", "langT": "Choisissez votre langue", "langX": "Le guide et toute la fenêtre l’utiliseront. Vous pourrez la changer ici, en haut à droite.", "zt": "Toujours à portée", "z": "Rouvrez ce guide quand vous voulez avec le bouton Guide.", "q1t": "Presets", "q1": "Voix, Batterie, Dialogue, Doux et Minimal, plus les vôtres. Comparer bascule entre vos changements et le preset chargé.", "q2t": "Chaque type de fondu", "q2": "Fondus d’entrée, enchaînés et de sortie, dessinés à l’échelle : faites glisser les durées ou tapez-les en ms, choisissez la forme, et créez de nouveaux fondus ou ajustez ceux qui existent.", "q3t": "Sur quoi il agit", "q3": "Sélectionnez des pistes audio dans LUNA et, si vous voulez, une zone : chaque clip reçoit le bon fondu, jamais plus de 45 % du clip. Ici, vous voyez combien de fondus Appliquer va créer.", "q4t": "Appliquez", "q4": "Appliquer les crée tous d’un coup. Retirer les fondus les enlève de la sélection, et Annuler revient sur le dernier passage."}, "de": {"help": "Kurzanleitung", "helpBtn": "Anleitung", "tNext": "Weiter", "tBack": "Zurück", "tSkip": "Überspringen", "tDone": "Verstanden", "langT": "Wähle deine Sprache", "langX": "Die Anleitung und das ganze Fenster verwenden sie. Du kannst sie später hier oben rechts ändern.", "zt": "Immer zur Hand", "z": "Öffne diese Anleitung jederzeit wieder mit dem Button Anleitung.", "q1t": "Presets", "q1": "Vocal, Drums, Dialog, Sanft und Minimal, dazu deine eigenen. Vergleichen schaltet zwischen deinen Änderungen und dem geladenen Preset um.", "q2t": "Jede Art von Blende", "q2": "Einblenden, Überblenden und Ausblenden, maßstabsgetreu gezeichnet: zieh die Längen oder tipp sie in ms ein, wähl die Form und ob neue Blenden entstehen oder vorhandene angepasst werden.", "q3t": "Worauf es wirkt", "q3": "Wähle in LUNA Audiospuren und, wenn du willst, einen Bereich: jeder Clip darin bekommt die passende Blende, nie mehr als 45 % des Clips. Hier siehst du, wie viele Blenden Anwenden macht.", "q4t": "Anwenden", "q4": "Anwenden erstellt alle auf einmal. Blenden entfernen nimmt sie aus der Auswahl, und Rückgängig nimmt den letzten Durchgang zurück."}, "it": {"help": "Guida rapida", "helpBtn": "Guida", "tNext": "Avanti", "tBack": "Indietro", "tSkip": "Salta", "tDone": "Capito", "langT": "Scegli la tua lingua", "langX": "La guida e tutta la finestra la useranno. Puoi cambiarla poi qui, in alto a destra.", "zt": "Sempre a portata di mano", "z": "Riapri questa guida quando ti serve con il pulsante Guida.", "q1t": "Preset", "q1": "Voce, Batteria, Dialogo, Morbido e Minimo, più i tuoi. Confronta passa dalle tue modifiche al preset caricato.", "q2t": "Ogni tipo di dissolvenza", "q2": "Dissolvenze in entrata, incrociate e in uscita, disegnate in scala: trascina le durate o scrivile in ms, scegli la forma e decidi se crearne di nuove o regolare quelle già presenti.", "q3t": "Su cosa lavora", "q3": "Seleziona tracce audio in LUNA e, se vuoi, un intervallo: ogni clip riceve la dissolvenza giusta, mai più del 45 % del clip. Qui vedi quante dissolvenze farà Applica.", "q4t": "Applica", "q4": "Applica le crea tutte insieme. Togli dissolvenze le rimuove dalla selezione e Annulla torna indietro sull’ultimo passaggio."}, "pt": {"help": "Guia rápido", "helpBtn": "Guia", "tNext": "Seguinte", "tBack": "Voltar", "tSkip": "Saltar", "tDone": "Percebi", "langT": "Escolhe o teu idioma", "langX": "O guia e toda a janela vão usá-lo. Podes mudá-lo depois aqui, em cima à direita.", "zt": "Sempre à mão", "z": "Volta a este guia quando precisares com o botão Guia.", "q1t": "Presets", "q1": "Voz, Bateria, Diálogo, Suave e Mínimo, mais os teus. Comparar alterna entre as tuas alterações e o preset carregado.", "q2t": "Cada tipo de fade", "q2": "Fades de entrada, cruzados e de saída, desenhados à escala: arrasta as durações ou escreve-as em ms, escolhe a forma e decide se crias fades novos ou ajustas os que já existem.", "q3t": "Onde trabalha", "q3": "Seleciona faixas de áudio no LUNA e, se quiseres, um intervalo: cada clip recebe o fade certo, nunca mais de 45 % do clip. Aqui vês quantos fades Aplicar vai fazer.", "q4t": "Aplica", "q4": "Aplicar faz todos de uma vez. Tirar fades retira-os da seleção e Desfazer reverte a última passagem."}})) Object.assign(I18N[c], v);
  // Fades 1.2: Strip silence.
  for (const [c, v] of Object.entries({"es": {"tabF": "Fundidos", "tabS": "Cortar silencios", "tabNew": "NUEVO", "sDet": "Qué es silencio", "sThr": "Umbral", "sMin": "Silencio mínimo", "sPre": "Margen antes", "sPost": "Margen después", "sZones": "{n} zonas", "sEdges": "{n} bordes", "sFinNote": "Corto para no ablandar el ataque. Cabe dentro del margen antes.", "sFinWarn": "Más largo que el margen antes: tocará el ataque.", "sFoutNote": "Suaviza la cola justo donde se corta.", "pSil": "silencios fuera", "sApplyN": "Quitar {n} silencios y hacer {f} fundidos", "sApply": "Cortar silencios", "sRule": "Deshacer lo devuelve todo de un clic.", "sView": "vista previa · {from} → {to}", "lgThr": "Umbral", "lgCut": "Se quita", "lgPad": "Margen", "lgFade": "Fundidos", "sReading": "Leyendo la forma de onda…", "sNoOverview": "LUNA aún no ha analizado este audio: espera un momento y vuelve a probar", "sWorking": "Cortando {i} de {n}…", "sDone": "{n} silencios quitados · {f} fundidos", "sNothing": "No hay silencios con estos ajustes", "sPreset": "Preset", "pToms": "Toms", "pKick": "Bombo y caja", "pCustom": "Personalizado", "q5t": "Cortar silencios", "q5": "Quita lo que no suena en todas las pistas seleccionadas y deja hechos los fundidos de cada corte nuevo. Ves lo que se quitará antes de aplicar y lo deshaces de un clic."}, "en": {"tabF": "Fades", "tabS": "Strip silence", "tabNew": "NEW", "sDet": "What counts as silence", "sThr": "Threshold", "sMin": "Minimum silence", "sPre": "Margin before", "sPost": "Margin after", "sZones": "{n} zones", "sEdges": "{n} edges", "sFinNote": "Short, so the attack stays sharp. It fits inside the margin before.", "sFinWarn": "Longer than the margin before: it will touch the attack.", "sFoutNote": "Smooths the tail right where it is cut.", "pSil": "silences out", "sApplyN": "Remove {n} silences and make {f} fades", "sApply": "Strip silence", "sRule": "Undo takes it all back in one click.", "sView": "preview · {from} → {to}", "lgThr": "Threshold", "lgCut": "Removed", "lgPad": "Margin", "lgFade": "Fades", "sReading": "Reading the waveform…", "sNoOverview": "LUNA has not analysed this audio yet: wait a moment and try again", "sWorking": "Cutting {i} of {n}…", "sDone": "{n} silences removed · {f} fades", "sNothing": "No silences with these settings", "sPreset": "Preset", "pToms": "Toms", "pKick": "Kick and snare", "pCustom": "Custom", "q5t": "Strip silence", "q5": "Removes what does not sound on every selected track and fades every new cut. You see what will go before you apply, and undo it all in one click."}, "ca": {"tabF": "Fosos", "tabS": "Tallar silencis", "tabNew": "NOU", "sDet": "Què és silenci", "sThr": "Llindar", "sMin": "Silenci mínim", "sPre": "Marge abans", "sPost": "Marge després", "sZones": "{n} zones", "sEdges": "{n} vores", "sFinNote": "Curt per no estovar l’atac. Cap dins del marge abans.", "sFinWarn": "Més llarg que el marge abans: tocarà l’atac.", "sFoutNote": "Suavitza la cua just on es talla.", "pSil": "silencis fora", "sApplyN": "Treure {n} silencis i fer {f} fosos", "sApply": "Tallar silencis", "sRule": "Desfer ho torna tot amb un clic.", "sView": "vista prèvia · {from} → {to}", "lgThr": "Llindar", "lgCut": "Es treu", "lgPad": "Marge", "lgFade": "Fosos", "sReading": "Llegint la forma d’ona…", "sNoOverview": "LUNA encara no ha analitzat aquest àudio: espera un moment i torna-ho a provar", "sWorking": "Tallant {i} de {n}…", "sDone": "{n} silencis trets · {f} fosos", "sNothing": "No hi ha silencis amb aquests ajustos", "sPreset": "Preset", "pToms": "Toms", "pKick": "Bombo i caixa", "pCustom": "Personalitzat", "q5t": "Tallar silencis", "q5": "Treu el que no sona a totes les pistes seleccionades i deixa fets els fosos de cada tall nou. Veus què es traurà abans d’aplicar i ho desfàs amb un clic."}, "fr": {"tabF": "Fondus", "tabS": "Couper les silences", "tabNew": "NOUVEAU", "sDet": "Ce qui compte comme silence", "sThr": "Seuil", "sMin": "Silence minimum", "sPre": "Marge avant", "sPost": "Marge après", "sZones": "{n} zones", "sEdges": "{n} bords", "sFinNote": "Court, pour garder l’attaque nette. Il tient dans la marge avant.", "sFinWarn": "Plus long que la marge avant : il touchera l’attaque.", "sFoutNote": "Adoucit la queue juste là où elle est coupée.", "pSil": "silences retirés", "sApplyN": "Retirer {n} silences et faire {f} fondus", "sApply": "Couper les silences", "sRule": "Annuler remet tout en un clic.", "sView": "aperçu · {from} → {to}", "lgThr": "Seuil", "lgCut": "Retiré", "lgPad": "Marge", "lgFade": "Fondus", "sReading": "Lecture de la forme d’onde…", "sNoOverview": "LUNA n’a pas encore analysé cet audio : attendez un instant et réessayez", "sWorking": "Coupe {i} sur {n}…", "sDone": "{n} silences retirés · {f} fondus", "sNothing": "Aucun silence avec ces réglages", "sPreset": "Preset", "pToms": "Toms", "pKick": "Grosse caisse et caisse claire", "pCustom": "Personnalisé", "q5t": "Couper les silences", "q5": "Retire ce qui ne sonne pas sur toutes les pistes sélectionnées et pose un fondu sur chaque nouvelle coupe. Vous voyez ce qui partira avant d’appliquer, et tout s’annule en un clic."}, "de": {"tabF": "Blenden", "tabS": "Stille entfernen", "tabNew": "NEU", "sDet": "Was als Stille gilt", "sThr": "Schwelle", "sMin": "Mindeststille", "sPre": "Vorlauf", "sPost": "Nachlauf", "sZones": "{n} Zonen", "sEdges": "{n} Kanten", "sFinNote": "Kurz, damit der Anschlag knackig bleibt. Passt in den Vorlauf.", "sFinWarn": "Länger als der Vorlauf: berührt den Anschlag.", "sFoutNote": "Glättet das Ausklingen genau am Schnitt.", "pSil": "Stellen entfernt", "sApplyN": "{n} Stellen entfernen und {f} Blenden setzen", "sApply": "Stille entfernen", "sRule": "Rückgängig nimmt alles mit einem Klick zurück.", "sView": "Vorschau · {from} → {to}", "lgThr": "Schwelle", "lgCut": "Fällt weg", "lgPad": "Rand", "lgFade": "Blenden", "sReading": "Wellenform wird gelesen…", "sNoOverview": "LUNA hat dieses Audio noch nicht analysiert: kurz warten und erneut versuchen", "sWorking": "Schneide {i} von {n}…", "sDone": "{n} Stellen entfernt · {f} Blenden", "sNothing": "Keine Stille mit diesen Einstellungen", "sPreset": "Preset", "pToms": "Toms", "pKick": "Kick und Snare", "pCustom": "Eigene", "q5t": "Stille entfernen", "q5": "Entfernt, was auf den gewählten Spuren nicht klingt, und setzt an jedem neuen Schnitt eine Blende. Du siehst vor dem Anwenden, was wegfällt, und machst alles mit einem Klick rückgängig."}, "it": {"tabF": "Dissolvenze", "tabS": "Taglia silenzi", "tabNew": "NUOVO", "sDet": "Cosa è silenzio", "sThr": "Soglia", "sMin": "Silenzio minimo", "sPre": "Margine prima", "sPost": "Margine dopo", "sZones": "{n} zone", "sEdges": "{n} bordi", "sFinNote": "Corta per non ammorbidire l’attacco. Sta dentro il margine prima.", "sFinWarn": "Più lunga del margine prima: toccherà l’attacco.", "sFoutNote": "Ammorbidisce la coda proprio dove viene tagliata.", "pSil": "silenzi tolti", "sApplyN": "Togli {n} silenzi e fai {f} dissolvenze", "sApply": "Taglia silenzi", "sRule": "Annulla riporta tutto con un clic.", "sView": "anteprima · {from} → {to}", "lgThr": "Soglia", "lgCut": "Si toglie", "lgPad": "Margine", "lgFade": "Dissolvenze", "sReading": "Lettura della forma d’onda…", "sNoOverview": "LUNA non ha ancora analizzato questo audio: aspetta un momento e riprova", "sWorking": "Taglio {i} di {n}…", "sDone": "{n} silenzi tolti · {f} dissolvenze", "sNothing": "Nessun silenzio con queste impostazioni", "sPreset": "Preset", "pToms": "Tom", "pKick": "Cassa e rullante", "pCustom": "Personalizzato", "q5t": "Taglia silenzi", "q5": "Toglie ciò che non suona su tutte le tracce selezionate e mette una dissolvenza su ogni nuovo taglio. Vedi cosa sparirà prima di applicare e annulli tutto con un clic."}, "pt": {"tabF": "Fades", "tabS": "Cortar silêncios", "tabNew": "NOVO", "sDet": "O que é silêncio", "sThr": "Limiar", "sMin": "Silêncio mínimo", "sPre": "Margem antes", "sPost": "Margem depois", "sZones": "{n} zonas", "sEdges": "{n} bordas", "sFinNote": "Curto para não amolecer o ataque. Cabe dentro da margem antes.", "sFinWarn": "Mais longo que a margem antes: vai tocar no ataque.", "sFoutNote": "Suaviza a cauda mesmo onde é cortada.", "pSil": "silêncios fora", "sApplyN": "Tirar {n} silêncios e fazer {f} fades", "sApply": "Cortar silêncios", "sRule": "Desfazer devolve tudo num clique.", "sView": "pré-visualização · {from} → {to}", "lgThr": "Limiar", "lgCut": "Sai", "lgPad": "Margem", "lgFade": "Fades", "sReading": "A ler a forma de onda…", "sNoOverview": "O LUNA ainda não analisou este áudio: espera um momento e tenta outra vez", "sWorking": "A cortar {i} de {n}…", "sDone": "{n} silêncios tirados · {f} fades", "sNothing": "Não há silêncios com estes ajustes", "sPreset": "Preset", "pToms": "Timbalões", "pKick": "Bombo e tarola", "pCustom": "Personalizado", "q5t": "Cortar silêncios", "q5": "Tira o que não soa em todas as faixas selecionadas e deixa feitos os fades de cada corte novo. Vês o que vai sair antes de aplicar e desfazes tudo num clique."}})) Object.assign(I18N[c], v);
  let tour = null;
  let theme = store.get('theme') === 'grey' ? 'grey' : 'dark';
  const COLORS = ['yellow', 'orange', 'red', 'green', 'blue', 'pink', 'purple'];
  let color = COLORS.includes(store.get('color')) ? store.get('color') : 'green';
  const closeColors = () => { $('colorMenu').hidden = true; $('colorBtn').classList.remove('open'); };
  $('colorBtn').onclick = (ev) => { ev.stopPropagation(); const open = $('colorMenu').hidden; $('colorMenu').hidden = !open; $('colorBtn').classList.toggle('open', open); };
  document.addEventListener('mousedown', (ev) => { if (!ev.target.closest?.('.colors')) closeColors(); });
  document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') closeColors(); });
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
  // What to do with fades already there, for all three kinds at once; 'custom' keeps each
  // card's own choice (the 1.0 way).
  const MODES = { new: { create: true, adjShape: false, adjLen: false }, both: { create: true, adjShape: true, adjLen: true }, adjust: { create: false, adjShape: true, adjLen: true } };
  const modeOf = () => { for (const [m, v] of Object.entries(MODES)) if (['fin', 'xf', 'fout'].every((k) => opts[k].create === v.create && opts[k].adjShape === v.adjShape && opts[k].adjLen === v.adjLen)) return m; return 'custom'; };
  let mode = store.get('mode') ?? modeOf();
  const eff = (k) => (mode === 'custom' ? opts[k] : { ...opts[k], ...MODES[mode] });
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
  const W = 880, H = 112, TOP = 26, BOT = H - 14;
  const curvePts = (shape, x0, x1, up) => { const p = []; for (let i = 0; i <= 36; i++) { const f = i / 36, g = gain(shape, up ? f : 1 - f); p.push([x0 + (x1 - x0) * f, BOT - g * (BOT - TOP)]); } return p; };
  const pathOf = (pts) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join('');
  function drawStrip() {
    const cut = W / 2, A0 = 16, B1 = W - 16;
    const fi = msToPx(opts.fin.ms), fo = msToPx(opts.fout.ms), xw = msToPx(opts.xf.ms);
    const sh = opts.xf.align === 'before' ? -xw / 2 : opts.xf.align === 'after' ? xw / 2 : 0;
    const xs = cut - xw / 2 + sh, xe = cut + xw / 2 + sh;
    const on = (k) => { const o = eff(k); return o.create || o.adjShape || o.adjLen; };
    const parts = [];
    // Clip bodies: A runs to the end of the crossfade, B starts at its start.
    parts.push(`<rect class="clip a" x="${A0}" y="${TOP - 10}" width="${(on('xf') ? xe : cut) - A0}" height="${BOT - TOP + 20}" rx="10"/>`);
    parts.push(`<rect class="clip b" x="${on('xf') ? xs : cut}" y="${TOP - 10}" width="${B1 - (on('xf') ? xs : cut)}" height="${BOT - TOP + 20}" rx="10"/>`);
    parts.push(`<text class="cl" x="${A0 + 12}" y="${BOT + 4}">A</text><text class="cl" x="${B1 - 20}" y="${BOT + 4}">B</text>`);
    const zone = (k, x0, x1, inner) => `<g class="zone ${k}${on(k) ? '' : ' off'}" data-k="${k}"><rect class="hot" x="${x0}" y="${TOP - 10}" width="${x1 - x0}" height="${BOT - TOP + 20}"/>${inner}</g>`;
    const fill = (pts, cls) => `<path class="fill ${cls}" d="${pathOf(pts)}L${pts.at(-1)[0]} ${BOT}L${pts[0][0]} ${BOT}Z"/><path class="curve ${cls}" d="${pathOf(pts)}"/>`;
    parts.push(zone('fin', A0, A0 + fi, fill(curvePts(opts.fin.shape, A0, A0 + fi, true), 'in')));
    parts.push(zone('fout', B1 - fo, B1, fill(curvePts(opts.fout.shape, B1 - fo, B1, false), 'out')));
    parts.push(zone('xf', xs, xe, `${fill(curvePts(opts.xf.shape, xs, xe, false), 'x x2')}${fill(curvePts(opts.xf.shape, xs, xe, true), 'x')}`));
    parts.push(`<line class="cut" x1="${cut}" x2="${cut}" y1="${TOP - 18}" y2="${BOT + 12}"/>`);
    // Handles to drag each fade's length.
    const handle = (k, x) => `<g class="handle${on(k) ? '' : ' off'}" data-k="${k}"><line x1="${x}" x2="${x}" y1="${TOP - 4}" y2="${BOT + 4}"/><circle cx="${x}" cy="${TOP - 4}" r="6"/></g>`;
    parts.push(handle('fin', A0 + fi), handle('fout', B1 - fo), handle('xf', opts.xf.align === 'before' ? xs : xe));
    const label = (x, txt, k) => `<text class="ms ${k}" x="${x}" y="${TOP - 13}" text-anchor="middle">${txt}</text>`;
    parts.push(label(Math.max(A0 + 22, A0 + fi / 2), `${opts.fin.ms} ms`, 'fin'), label(Math.min(B1 - 22, B1 - fo / 2), `${opts.fout.ms} ms`, 'fout'), label((xs + xe) / 2, `${opts.xf.ms} ms`, 'xf'));
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
  // A crossfade drawn where it sits against the cut (the dashed line).
  const placeIcon = (a) => { const x0 = a === 'before' ? 2 : a === 'after' ? 13 : 7.5, x1 = x0 + 11; return `<svg viewBox="0 0 26 14"><path d="M${x0} 13C${x0 + 4} 4 ${x0 + 7} 1 ${x1} 1"/><path d="M${x0} 1C${x0 + 4} 1 ${x0 + 7} 4 ${x1} 13" opacity=".55"/><line x1="13" x2="13" y1="0" y2="14" class="pc"/></svg>`; };
  let focused = null;
  function focusCard(k) { focused = k; for (const c of document.querySelectorAll('.card3')) c.classList.toggle('focus', c.dataset.k === k); }
  function card(k) {
    const o = opts[k];
    const c = document.createElement('section');
    const e = eff(k);
    c.className = `card3 ${k}${focused === k ? ' focus' : ''}${e.create || e.adjShape || e.adjLen ? '' : ' off'}`;
    c.dataset.k = k;
    c.innerHTML = `<header><i class="dot"></i><b></b><label class="num"><input type="text" inputmode="decimal"><span>ms</span></label></header><div class="field"><span class="fl"></span><div class="seg sh"></div></div>${k === 'xf' ? '<div class="field"><span class="fl pl"></span><div class="seg place"></div></div>' : ''}<div class="field"><span class="fl ap"></span><div class="chips"></div></div>`;
    c.querySelector('b').textContent = t(k);
    const inp = c.querySelector('input'); inp.value = String(o.ms);
    inp.onchange = () => { const v = Number(String(inp.value).replace(',', '.')); if (Number.isFinite(v) && v > 0) { o.ms = Math.min(5000, Math.round(v * 10) / 10); touched(); } else inp.value = String(o.ms); };
    inp.onkeydown = (e) => { if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); const step = e.shiftKey ? 10 : 1; o.ms = Math.max(0.1, Math.min(5000, Math.round((o.ms + (e.key === 'ArrowUp' ? step : -step)) * 10) / 10)); touched(); } };
    c.querySelector('.fl').textContent = t('shape');
    c.querySelector('.sh').replaceChildren(...SHAPE_KEYS.map((s) => { const b = document.createElement('button'); b.innerHTML = `${shapeIcon(s, k === 'fout', k === 'xf')}<span></span>`; b.querySelector('span').textContent = t(s + 'S'); b.title = t(s); b.classList.toggle('on', o.shape === s); b.onclick = () => { o.shape = s; touched(); }; return b; }));
    if (k === 'xf') {
      c.querySelector('.pl').textContent = t('placement');
      c.querySelector('.place').replaceChildren(...['before', 'center', 'after'].map((a) => { const b = document.createElement('button'); b.innerHTML = `${placeIcon(a)}<span></span>`; b.querySelector('span').textContent = t(a + 'S'); b.title = t(a); b.classList.toggle('on', o.align === a); b.onclick = () => { o.align = a; touched(); }; return b; }));
    }
    c.querySelector('.ap').textContent = t('applyTo');
    c.querySelector('.ap').title = t('applyTip');
    c.querySelector('.chips').replaceChildren(...[['create', 'newOnes'], ['adjShape', 'theirShape'], ['adjLen', 'theirLen']].map(([f, lk]) => { const b = document.createElement('button'); b.className = `tog${o[f] ? ' on' : ''}`; b.textContent = t(lk); b.title = t(f === 'create' ? (k === 'fin' ? 'createIn' : k === 'xf' ? 'createX' : 'createOut') : f === 'adjShape' ? 'adjShape' : 'adjLen'); b.onclick = () => { o[f] = !o[f]; touched(); }; return b; }));
    if (mode !== 'custom') { c.querySelector('.ap')?.closest('.field')?.remove(); }
    c.onclick = () => focusCard(k);
    return c;
  }
  function paintCards(numbersOnly) {
    if (numbersOnly) { for (const c of document.querySelectorAll('.card3')) { const inp = c.querySelector('.num input'); if (document.activeElement !== inp) inp.value = String(opts[c.dataset.k].ms); } return; }
    $('cards').replaceChildren(card('fin'), card('xf'), card('fout'));
  }
  const shapeIcon = (s, down, cross) => {
    const d = s === 'linear' ? 'M1 13L21 1' : s === 'log' ? 'M1 13C3 4 9 1 21 1' : 'M1 13C8 12 15 7 21 1';
    // A crossfade is two curves: the one coming in, and the one going out (mirrored, fainter).
    if (cross) return `<svg viewBox="0 0 22 14"><path d="${d}"/><path d="${d}" opacity=".55" transform="translate(22 0) scale(-1 1)"/></svg>`;
    return `<svg viewBox="0 0 22 14"${down ? ' style="transform:scaleX(-1)"' : ''}><path d="${d}"/></svg>`;
  };
  const touched = () => { compareA = null; save(); paint(); };
  function paintMode() {
    $('modeLabel').textContent = t('modeLabel');
    $('mode').replaceChildren(...[['new', 'mNew'], ['both', 'mBoth'], ['adjust', 'mAdjust']].map(([m, k]) => { const b = document.createElement('button'); b.textContent = t(k); b.className = mode === m ? 'on' : ''; b.onclick = () => setMode(m); return b; }));
    $('perType').textContent = t('perType'); $('perType').classList.toggle('on', mode === 'custom');
  }
  function setMode(m) {
    // Leaving a mode for the per-type view starts each card from what that mode did.
    if (m === 'custom' && mode !== 'custom') for (const k of ['fin', 'xf', 'fout']) Object.assign(opts[k], MODES[mode]);
    mode = m; store.set('mode', m); save(); paint();
  }
  $('perType').onclick = () => setMode(mode === 'custom' ? modeOf() === 'custom' ? 'both' : modeOf() : 'custom');

  let repaint = () => {};
  function paint() {
    paintMode();
    drawStrip();
    paintCards();
    paintPresets();
    $('compare').classList.toggle('on', !!compareA);
    $('compare').disabled = !presetById(loaded);
    repaint();
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

  // ---- Strip silence (1.2): settings, presets, the three cards ------------------------------------
  let tab = store.get('tab') === 'strip' ? 'strip' : 'fades';
  const SPRESETS = {
    toms: { thr: -40, minSil: 200, pre: 5, post: 250, fin: { ms: 2, shape: 'linear' }, fout: { ms: 80, shape: 'log' } },
    kick: { thr: -36, minSil: 120, pre: 3, post: 150, fin: { ms: 1, shape: 'linear' }, fout: { ms: 40, shape: 'log' } },
    voice: { thr: -45, minSil: 300, pre: 30, post: 120, fin: { ms: 10, shape: 'equal_power' }, fout: { ms: 60, shape: 'log' } },
    dialog: { thr: -50, minSil: 500, pre: 60, post: 200, fin: { ms: 20, shape: 'equal_power' }, fout: { ms: 100, shape: 'equal_power' } },
  };
  const SKEYS = { toms: 'pToms', kick: 'pKick', voice: 'voice', dialog: 'dialog' };
  let sopts = { preset: 'toms', ...clone(SPRESETS.toms), ...(store.get('sopts') ?? {}) };
  const ssave = () => store.set('sopts', sopts);
  const spresetOf = () => { for (const [k, p] of Object.entries(SPRESETS)) if (['thr', 'minSil', 'pre', 'post'].every((f) => p[f] === sopts[f]) && ['fin', 'fout'].every((f) => p[f].ms === sopts[f].ms && p[f].shape === sopts[f].shape)) return k; return 'custom'; };
  // The range of each control, and its step.
  const SCTL = { thr: [-80, -10, 1, 'dB'], minSil: [20, 2000, 10, 'ms'], pre: [0, 200, 1, 'ms'], post: [0, 1000, 5, 'ms'] };
  let stripRefresh = () => {}, stripRedraw = () => {};
  const stouched = () => { sopts.preset = spresetOf(); ssave(); paintSCards(true); stripRedraw(); };
  function setTab(x) {
    tab = x; store.set('tab', x); document.body.dataset.tab = x;
    $('tabF').classList.toggle('on', x === 'fades'); $('tabS').classList.toggle('on', x === 'strip');
    if (x === 'strip') stripRefresh(); else repaint();
  }
  $('tabF').onclick = () => setTab('fades');
  $('tabS').onclick = () => setTab('strip');
  // The guide walks the Fades tab.
  $('help').addEventListener('click', () => { if (tab !== 'fades') setTab('fades'); }, true);
  function sNum(o, f, lo, hi, cls = '') {
    const l = document.createElement('label'); l.className = 'num';
    l.innerHTML = `<input type="text" inputmode="decimal" class="${cls}"><span></span>`;
    const inp = l.querySelector('input');
    const get = () => (f in o ? o[f] : o.ms);
    const put = (v) => { if (f in o) o[f] = v; else o.ms = v; };
    inp.value = String(get());
    inp.onchange = () => { const v = Number(String(inp.value).replace(',', '.').replace('−', '-')); if (Number.isFinite(v)) { put(Math.max(lo, Math.min(hi, Math.round(v * 10) / 10))); stouched(); } else inp.value = String(get()); };
    inp.onkeydown = (e) => { if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); const st = e.shiftKey ? 10 : 1; put(Math.max(lo, Math.min(hi, Math.round((get() + (e.key === 'ArrowUp' ? st : -st)) * 10) / 10))); inp.value = String(get()); stouched(); } };
    inp.dataset.f = f;
    return l;
  }
  function paintSCards(numbersOnly) {
    if (numbersOnly) {
      for (const inp of document.querySelectorAll('#scards .num input')) { if (document.activeElement === inp) continue; const f = inp.dataset.f; const o = inp.closest('.card3').dataset.k === 'det' ? sopts : sopts[inp.closest('.card3').dataset.k === 'sfin' ? 'fin' : 'fout']; inp.value = String(f in o ? o[f] : o.ms); }
      for (const r of document.querySelectorAll('#scards input[type=range]')) if (document.activeElement !== r) r.value = String(sopts[r.dataset.f]);
      const ps = document.querySelector('#scards .spre'); if (ps) ps.value = sopts.preset;
      const nt = document.querySelector('#scards .sfin .note'); if (nt) { const warn = sopts.fin.ms > sopts.pre; nt.textContent = t(warn ? 'sFinWarn' : 'sFinNote'); nt.classList.toggle('warn', warn); }
      return;
    }
    // What counts as silence: preset, threshold, minimum silence, margins.
    const det = document.createElement('section'); det.className = 'card3 det'; det.dataset.k = 'det';
    det.innerHTML = '<header><i class="dot"></i><b></b><select class="spre"></select></header>';
    det.querySelector('b').textContent = t('sDet');
    const ps = det.querySelector('.spre');
    ps.title = t('sPreset');
    ps.replaceChildren(...[...Object.keys(SPRESETS), 'custom'].map((k) => Object.assign(document.createElement('option'), { value: k, textContent: t(k === 'custom' ? 'pCustom' : SKEYS[k]), disabled: k === 'custom' })));
    ps.value = sopts.preset;
    ps.onchange = () => { const p = SPRESETS[ps.value]; if (!p) return; sopts = { preset: ps.value, ...clone(p) }; ssave(); paintSCards(); stripRedraw(); };
    for (const [f, lk] of [['thr', 'sThr'], ['minSil', 'sMin'], ['pre', 'sPre'], ['post', 'sPost']]) {
      const [lo, hi, st, unit] = SCTL[f];
      const row = document.createElement('div'); row.className = 'srow';
      row.innerHTML = `<span class="fl"></span><input type="range" min="${lo}" max="${hi}" step="${st}">`;
      row.querySelector('.fl').textContent = t(lk);
      const r = row.querySelector('input'); r.value = String(sopts[f]); r.dataset.f = f;
      r.oninput = () => { sopts[f] = Number(r.value); stouched(); };
      const nb = sNum(sopts, f, lo, hi); nb.querySelector('span').textContent = unit;
      row.append(nb);
      det.append(row);
    }
    // The fades on the new edges.
    const fcard = (k, o, noteKey) => {
      const c = document.createElement('section'); c.className = `card3 ${k}`; c.dataset.k = k;
      c.innerHTML = '<header><i class="dot"></i><b></b></header><div class="field"><span class="fl"></span><div class="seg sh"></div></div><p class="note"></p>';
      c.querySelector('b').textContent = t(k === 'sfin' ? 'fin' : 'fout');
      const nb = sNum(o, 'ms', 0.1, 2000); nb.querySelector('span').textContent = 'ms';
      c.querySelector('header').append(nb);
      c.querySelector('.fl').textContent = t('shape');
      c.querySelector('.sh').replaceChildren(...SHAPE_KEYS.map((s) => { const b = document.createElement('button'); b.innerHTML = `${shapeIcon(s, k === 'sfout', false)}<span></span>`; b.querySelector('span').textContent = t(s + 'S'); b.title = t(s); b.className = o.shape === s ? 'on' : ''; b.onclick = () => { o.shape = s; stouched(); paintSCards(); }; return b; }));
      const warn = k === 'sfin' && o.ms > sopts.pre;
      const nt = c.querySelector('.note'); nt.textContent = t(warn ? 'sFinWarn' : noteKey); nt.classList.toggle('warn', warn);
      return c;
    };
    $('scards').replaceChildren(det, fcard('sfin', sopts.fin, 'sFinNote'), fcard('sfout', sopts.fout, 'sFoutNote'));
  }
  function paintStripStatic() {
    $('tabF').querySelector('span').textContent = t('tabF');
    $('tabS').querySelector('span').textContent = t('tabS');
    $('tabNew').textContent = t('tabNew');
    $('sRule').textContent = t('sRule');
    for (const [id, k] of [['pSil', 'pSil'], ['pSin', 'pIn'], ['pSout', 'pOut']]) $(id).querySelector('em').textContent = t(k);
    $('sLegend').innerHTML = [['thr', 'lgThr'], ['cutk', 'lgCut'], ['pad', 'lgPad'], ['fd', 'lgFade']].map(([c, k]) => `<span><i class="${c}"></i>${t(k)}</span>`).join('');
    paintSCards();
    document.body.dataset.tab = tab;
    $('tabF').classList.toggle('on', tab === 'fades'); $('tabS').classList.toggle('on', tab === 'strip');
    stripRedraw();
  }

  function paintStatic() {
    document.documentElement.lang = lang;
    $('help').title = t('help'); $('help').setAttribute('aria-label', t('help')); { const q = document.createElement('b'); q.textContent = '?'; const sp = document.createElement('span'); sp.textContent = t('helpBtn'); $('help').replaceChildren(q, sp); }
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.color = color;
    $('colorBtn').title = t('color'); $('colorBtn').setAttribute('aria-label', t('color'));
    $('colorMenu').replaceChildren(...COLORS.map((c) => {
      const b = document.createElement('button');
      b.className = c === color ? 'on' : '';
      b.innerHTML = `<i class="sw" data-color="${c}" data-theme="${theme}"></i><span></span><svg viewBox="0 0 12 12"><path d="M2.5 6.5L5 9L9.5 3.5"/></svg>`;
      b.querySelector('span').textContent = t(`c${c[0].toUpperCase()}${c.slice(1)}`);
      b.onclick = () => { color = c; store.set('color', c); closeColors(); paintStatic(); };
      return b;
    }));
    $('rule').textContent = t('rule');
    for (const [id, k] of [['pFin', 'pIn'], ['pXf', 'pXf'], ['pFout', 'pOut']]) $(id).querySelector('em').textContent = t(k);
    $('ver').textContent = `v${VERSION}`;
    $('lang').replaceChildren(...Object.keys(I18N).map((c) => Object.assign(document.createElement('option'), { value: c, textContent: I18N[c]._name })));
    $('lang').value = lang;
    for (const [id, name] of [['tDark', 'dark'], ['tGrey', 'grey']]) { $(id).classList.toggle('on', theme === name); $(id).title = t(name); }
    for (const [id, k] of Object.entries({ presetsLabel: 'presets', compare: 'compare', saveOk: 'saveBtn', saveCancel: 'cancel', apply: 'apply', remove: 'remove', undo: 'undo' })) $(id).textContent = t(k);
    $('compare').title = t('compareTip');
    paintStripStatic();
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
    // What Apply would do right now: the same choices as apply(), without touching anything.
    function forecast(jobs) {
      let fin = 0, fout = 0, xf = 0;
      for (const j of jobs) {
        const c = j.clip, len = c.stop.value - c.start.value;
        const cap = (ticks) => Math.max(1, Math.min(ticks, Math.floor(len * 0.45)));
        if (!j.prev && plan(eff('fin'), j.has.in, cap(msToTicks(opts.fin.ms, c.start.value)))) fin++;
        if (!j.touchesNext && plan(eff('fout'), j.has.out, cap(msToTicks(opts.fout.ms, c.stop.value)))) fout++;
        if (j.next) {
          const nlen = j.next.stop.value - j.next.start.value;
          const want = Math.max(1, Math.min(msToTicks(opts.xf.ms, c.stop.value), Math.floor(Math.min(len, nlen) * 0.45)));
          if (plan(eff('xf'), j.has.xf, want)) xf++;
        }
      }
      return { fin, fout, xf };
    }
    let paintSeq = 0;
    async function paintTarget() {
      const seq = ++paintSeq;
      const { tracks, range } = selection();
      const pills = (f) => { for (const [id, n] of [['pFin', f.fin], ['pXf', f.xf], ['pFout', f.fout]]) { $(id).querySelector('b').textContent = String(n); $(id).classList.toggle('zero', !n); } };
      if (!tracks.length) {
        $('tMain').textContent = t('noTarget'); $('tSub').textContent = '';
        $('tbar').classList.remove('ready'); pills({ fin: 0, xf: 0, fout: 0 });
        $('apply').textContent = t('apply'); $('apply').disabled = $('remove').disabled = true;
        return;
      }
      let jobs = [];
      try { ({ jobs } = await gather()); } catch (e) { note('gather failed', { e: errText(e) }); }
      if (seq !== paintSeq) return;
      const f = forecast(jobs), total = f.fin + f.xf + f.fout;
      const n = jobs.length;
      $('tMain').textContent = n ? `${tracks.length === 1 ? t('trk1') : t('trkN', { n: tracks.length })} · ${n === 1 ? t('clp1') : t('clpN', { n })}` : t('noClips');
      $('tSub').textContent = `${tracks.map((x) => x.name.value).join(', ')} · ${range ? t('range', { from: tl.formatBarBeat(range.S), to: tl.formatBarBeat(range.E) }) : t('wholeTracks')}`;
      $('tbar').classList.toggle('ready', total > 0);
      pills(f);
      $('apply').textContent = total === 1 ? t('apply1') : total ? t('applyN', { n: total }) : t('apply');
      $('apply').disabled = busy || !total;
      $('remove').disabled = busy || !n;
    }
    let paintTimer;
    repaint = () => { clearTimeout(paintTimer); paintTimer = setTimeout(() => { if (tab === 'strip') void stripRefresh(); else void paintTarget(); }, 120); };

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
            const p = plan(eff('fin'), j.has.in, cap(msToTicks(opts.fin.ms, c.start.value)));
            if (p) { await c.setFadeIn(p[0], p[1] ? { shape: p[1] } : {}); fin++; steps += j.has.in && p[1] && p[1] !== j.has.in.shape ? 2 : 1; }
          }
          if (!j.touchesNext) {
            const p = plan(eff('fout'), j.has.out, cap(msToTicks(opts.fout.ms, c.stop.value)));
            if (p) { await c.setFadeOut(p[0], p[1] ? { shape: p[1] } : {}); fout++; steps += j.has.out && p[1] && p[1] !== j.has.out.shape ? 2 : 1; }
          }
          if (j.next) {
            const nlen = j.next.stop.value - j.next.start.value;
            const want = Math.max(1, Math.min(msToTicks(opts.xf.ms, c.stop.value), Math.floor(Math.min(len, nlen) * 0.45)));
            const p = plan(eff('xf'), j.has.xf, want);
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

    // ---- Strip silence: read each selected track's waveform, find the silences, cut -----------------
    const SS = window.StripSilence;
    const MSP = 2;                                   // one point every 2 ms (LUNA's overview is ~2.6 ms)
    const cache = new Luna.Waveforms({ maxPages: 2048 });
    const reads = new Map();                         // track id -> { key, S, E, ticks, peaks, n }
    let found = [];                                  // [{ tk, data, det }]
    let previewId = null, stripSeq = 0;
    async function lanesOf(tk) {
      const lane = s.playlistFor(tk);
      if (!lane) return { lane: null, segs: [] };
      await lane.clips.load();
      await lane.compiledClips?.load?.().catch(() => undefined);
      const segs = (lane.compiledClips?.inOrder?.() ?? []).filter((g) => g.stop?.value > g.start?.value);
      return { lane, segs };
    }
    // An even grid of points in seconds over the span; each takes the loudest overview pair under
    // it, scaled by its clip's gain. Where no clip plays the point is null.
    async function readTrack(tk, range) {
      const { lane, segs } = await lanesOf(tk);
      const all = segs.length ? { S: Math.min(...segs.map((g) => g.start.value)), E: Math.max(...segs.map((g) => g.stop.value)) } : null;
      const sp = range ?? all;
      if (!sp) return null;
      const segsIn = segs.filter((g) => g.stop.value > sp.S && g.start.value < sp.E);
      const key = `${sp.S}:${sp.E}:${segsIn.map((g) => `${g.clipUid?.value}@${g.start.value}-${g.stop.value}`).join(',')}`;
      const old = reads.get(tk.id);
      if (old?.key === key) return old;
      if (!segsIn.length) { const d = { key, S: sp.S, E: sp.E, ticks: new Float64Array(0), peaks: [], n: 0, lane, missing: 0 }; reads.set(tk.id, d); return d; }
      await s.sources?.load?.().catch(() => undefined);
      const t0 = tl.seconds(sp.S), t1 = tl.seconds(sp.E);
      const n = Math.max(2, Math.min(600000, Math.round(((t1 - t0) * 1000) / MSP)));
      const ticks = new Float64Array(n), peaks = new Array(n).fill(null);
      for (let i = 0; i < n; i++) ticks[i] = tl.tickAtSeconds(t0 + (i * MSP) / 1000);
      const first = (tk0) => { let lo = 0, hi = n; while (lo < hi) { const m = (lo + hi) >> 1; if (ticks[m] < tk0) lo = m + 1; else hi = m; } return lo; };
      let missing = 0;
      for (const g of segsIn) {
        const clip = lane.clips.byId(g.clipUid.value);
        const audio = clip && Luna.compiledClipAudio(tl, g, clip, s.sources);
        if (!audio) { missing++; continue; }
        const a = Math.max(sp.S, g.start.value), b = Math.min(sp.E, g.stop.value);
        let nsA = Luna.audioNsAtTick(tl, g, audio, a), nsB = Luna.audioNsAtTick(tl, g, audio, b);
        nsA = Math.max(audio.startNs, nsA); nsB = Math.min(audio.stopNs, nsB);
        if (nsB <= nsA) continue;
        let rg;
        try { rg = await cache.range(audio.source, nsA, nsB, 'fine'); } catch (e) { note('overview', { e: errText(e) }); missing++; continue; }
        if (!rg?.count) { missing++; continue; }
        const lin = 10 ** ((Number(clip.gain?.value) || 0) / 20);
        const per = Math.max(1, Math.round((MSP * 1e6) / rg.pairNs));
        for (let i = first(a); i < n && ticks[i] < b; i++) {
          const ns = Luna.audioNsAtTick(tl, g, audio, ticks[i]);
          const p0 = Math.floor(ns / rg.pairNs) - rg.index;
          let pk = 0;
          for (let p = p0; p < p0 + per; p++) {
            if (p < 0 || p >= rg.count) continue;
            for (const ch of rg.channels) pk = Math.max(pk, Math.abs(ch.min[p]), Math.abs(ch.max[p]));
          }
          peaks[i] = pk * lin;
        }
      }
      const d = { key, S: sp.S, E: sp.E, ticks, peaks, n, lane, missing, segs: segsIn.length };
      reads.set(tk.id, d);
      note('read', { track: tk.name.value, n, clips: segsIn.length, missing });
      return d;
    }
    const detOpts = () => ({ thr: sopts.thr, minSil: sopts.minSil, pre: sopts.pre, post: sopts.post });
    // The silences of one track in ticks: [A, B) with whether audio sounds before and after.
    const zonesOf = (d, det) => det.sil.map((z) => ({ A: Math.round(d.ticks[z.a]), B: Math.round(z.b < d.n ? d.ticks[z.b] : d.E), before: z.before, after: z.after }));
    function stripTotals() {
      let sil = 0, fin = 0, fout = 0;
      for (const f of found) { const c = SS.count(f.det.sil); sil += c.sil; fin += c.fin; fout += c.fout; }
      return { sil, fin, fout };
    }
    function paintStripTarget() {
      const { tracks, range } = selection();
      const pills = (f) => { for (const [id, v] of [['pSil', f.sil], ['pSin', f.fin], ['pSout', f.fout]]) { $(id).querySelector('b').textContent = String(v); $(id).classList.toggle('zero', !v); } };
      if (!tracks.length) {
        $('sMain').textContent = t('noTarget'); $('sSub').textContent = ''; $('sbar').classList.remove('ready'); pills({ sil: 0, fin: 0, fout: 0 });
        $('sApply').textContent = t('sApply'); $('sApply').disabled = true; return;
      }
      const tot = stripTotals(), clips = found.reduce((a, f) => a + (f.data?.segs ?? 0), 0);
      $('sMain').textContent = `${tracks.length === 1 ? t('trk1') : t('trkN', { n: tracks.length })} · ${clips === 1 ? t('clp1') : t('clpN', { n: clips })}`;
      $('sSub').textContent = `${tracks.map((x) => x.name.value).join(', ')} · ${range ? t('range', { from: tl.formatBarBeat(range.S), to: tl.formatBarBeat(range.E) }) : t('wholeTracks')}`;
      $('sbar').classList.toggle('ready', tot.sil > 0);
      pills(tot);
      $('sApply').textContent = tot.sil ? t('sApplyN', { n: tot.sil, f: tot.fin + tot.fout }) : t('sApply');
      $('sApply').disabled = busy || !tot.sil;
    }
    // The preview: one track's waveform over the span on a dB scale, the threshold, what goes,
    // the margins and where the new fades go.
    function drawWave() {
      const svg = $('wave'), W2 = 880, H2 = 132, MID = H2 / 2, AMP = MID - 6;
      svg.setAttribute('viewBox', `0 0 ${W2} ${H2}`);
      const { tracks } = selection();
      const sel = $('sTrack');
      sel.replaceChildren(...tracks.map((x) => Object.assign(document.createElement('option'), { value: x.id, textContent: x.name.value })));
      if (!tracks.some((x) => x.id === previewId)) previewId = tracks[0]?.id ?? null;
      sel.value = previewId ?? ''; sel.disabled = tracks.length < 2;
      const f = found.find((x) => x.tk.id === previewId);
      if (!f || !f.data?.n) { $('sView').textContent = ''; svg.innerHTML = `<text class="empty" x="${W2 / 2}" y="${MID + 4}">${t(tracks.length ? 'noClips' : 'noTarget')}</text>`; return; }
      const d = f.data, n = d.n, X = (i) => (i / n) * W2;
      $('sView').textContent = t('sView', { from: tl.formatBarBeat(d.S), to: tl.formatBarBeat(d.E) });
      const yOf = (lin) => Math.max(0, Math.min(1, (SS.linToDb(lin) + 72) / 72)) * AMP;
      const parts = ['<defs><pattern id="hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="3" height="7" fill="var(--ccut)" opacity=".35"/></pattern></defs>'];
      // Sounding stretches (with their margins) as clips; silences hatched.
      const on = f.det.on;
      for (let i = 0; i < n;) {
        if (!on[i]) { i++; continue; }
        let j = i; while (j < n && on[j]) j++;
        parts.push(`<rect class="keep" x="${X(i).toFixed(1)}" y="4" width="${Math.max(1, X(j) - X(i)).toFixed(1)}" height="${H2 - 8}" rx="4"/>`);
        i = j;
      }
      for (const z of f.det.sil) parts.push(`<rect class="cutz" x="${X(z.a).toFixed(1)}" y="4" width="${Math.max(1, X(z.b) - X(z.a)).toFixed(1)}" height="${H2 - 8}"/><rect class="cutb" x="${X(z.a).toFixed(1)}" y="4" width="${Math.max(1, X(z.b) - X(z.a)).toFixed(1)}" height="${H2 - 8}"/>`);
      // The waveform, one column per pixel: the loudest point in it; brighter where it stays.
      let dim = '', lit = '';
      const cols = W2 * 2;
      for (let c = 0; c < cols; c++) {
        const i0 = Math.floor((c / cols) * n), i1 = Math.max(i0 + 1, Math.floor(((c + 1) / cols) * n));
        let pk = null, keep = false;
        for (let i = i0; i < i1 && i < n; i++) if (d.peaks[i] != null) { pk = Math.max(pk ?? 0, d.peaks[i]); if (on[i]) keep = true; }
        if (pk == null) continue;
        const x = ((c + 0.5) / cols) * W2, y = Math.max(0.5, yOf(pk));
        const seg = `M${x.toFixed(1)} ${(MID - y).toFixed(1)}V${(MID + y).toFixed(1)}`;
        if (keep) lit += seg; else dim += seg;
      }
      parts.push(`<path class="wv" d="${dim}"/><path class="wk" d="${lit}"/>`);
      // Fades on the new edges, drawn at a readable size.
      for (const z of f.det.sil) {
        if (z.before) { const x = X(z.a); parts.push(`<path class="fo" d="M${(x - 14).toFixed(1)} 8Q${(x - 2).toFixed(1)} 9 ${x.toFixed(1)} ${H2 - 6}"/>`); }
        if (z.after) { const x = X(z.b); parts.push(`<path class="fi" d="M${x.toFixed(1)} ${H2 - 6}L${(x + 6).toFixed(1)} 8"/>`); }
      }
      const ty = yOf(SS.dbToLin(sopts.thr));
      parts.push(`<line class="thr" x1="0" x2="${W2}" y1="${(MID - ty).toFixed(1)}" y2="${(MID - ty).toFixed(1)}"/><line class="thr" x1="0" x2="${W2}" y1="${(MID + ty).toFixed(1)}" y2="${(MID + ty).toFixed(1)}"/>`);
      parts.push(`<text class="thrl" x="${W2 - 4}" y="${(MID - ty - 4).toFixed(1)}" text-anchor="end">${String(sopts.thr).replace('-', '−')} dB</text>`);
      svg.innerHTML = parts.join('');
    }
    $('sTrack').onchange = () => { previewId = $('sTrack').value; drawWave(); };
    // Detection is cheap: run it again on every change of the controls.
    stripRedraw = () => {
      for (const f of found) f.det = f.data?.n ? SS.detect(f.data.peaks, MSP, detOpts()) : { sil: [], on: new Uint8Array(0) };
      drawWave(); paintStripTarget();
    };
    // Reading is not: only when the selection or the clips change, and only on this tab.
    stripRefresh = async (quiet) => {
      if (tab !== 'strip') return;
      const seq = ++stripSeq;
      const { tracks, range } = selection();
      const out = [];
      if (!quiet && tracks.some((tk) => !reads.has(tk.id))) say('sReading');
      let missing = 0, total = 0;
      for (const tk of tracks) {
        let data = null;
        try { data = await readTrack(tk, range); } catch (e) { note('read failed', { e: errText(e) }); }
        if (seq !== stripSeq) return;
        if (data) { missing += data.missing; total += data.segs ?? 0; }
        out.push({ tk, data, det: { sil: [], on: new Uint8Array(0) } });
      }
      found = out;
      if (missing && missing === total) say('sNoOverview', {}, 'bad', 6000); else if ($('status').textContent === t('sReading')) say(null);
      stripRedraw();
    };
    async function stripApply() {
      if (busy) return;
      busy = true; paintStripTarget();
      let removed = 0, fin = 0, fout = 0, steps = 0;
      try {
        await stripRefresh();
        const work = found.filter((f) => f.det.sil.length && f.data?.lane);
        let i = 0;
        for (const f of work) {
          i++; say('sWorking', { i, n: work.length });
          const lane = f.data.lane, zones = zonesOf(f.data, f.det);
          // 1. Cut every clip at every edge of every silence: one step for the whole track.
          const before = lane.clips.items.length;
          const cuts = [...new Set(zones.flatMap((z) => [z.A, z.B]))].sort((a, b) => a - b);
          await lane.split(cuts); steps++;
          for (let k = 0; k < 40 && lane.clips.items.length === before; k++) { await new Promise((r) => setTimeout(r, 50)); await lane.clips.load(); }
          // 2. Delete the pieces that lie inside a silence; 3. fade the pieces that now start or
          // end at one.
          const near = (a, b) => Math.abs(a - b) <= 2;
          const pieces = lane.clips.items.filter((c) => c.clipType?.value !== 'midi' && c.clipType?.value !== 'video').slice();
          const keep = [];
          for (const c of pieces) {
            const a = c.start.value, b = c.stop.value;
            if (zones.some((z) => a >= z.A - 2 && b <= z.B + 2)) { await c.delete(); removed++; steps++; } else keep.push(c);
          }
          for (const c of keep) {
            const a = c.start.value, b = c.stop.value, len = b - a;
            const cap = (tk0) => Math.max(1, Math.min(tk0, Math.floor(len * 0.45)));
            if (zones.some((z) => z.after && near(z.B, a))) { await c.setFadeIn(cap(msToTicks(sopts.fin.ms, a)), { shape: sopts.fin.shape }); fin++; steps++; }
            if (zones.some((z) => z.before && near(z.A, b))) { await c.setFadeOut(cap(msToTicks(sopts.fout.ms, b)), { shape: sopts.fout.shape }); fout++; steps++; }
          }
          reads.delete(f.tk.id);
        }
        undoSteps = steps;
        note('strip', { removed, fin, fout, steps, sopts });
        if (removed) say('sDone', { n: removed, f: fin + fout }, 'ok', 8000); else say('sNothing', {}, '', 5000);
      } catch (e) {
        undoSteps = steps;
        note('strip failed', { e: errText(e) });
        say('failed', { e: errText(e) }, 'bad', 9000);
      }
      busy = false;
      reads.clear();
      await stripRefresh(true);
    }
    $('sApply').onclick = () => void stripApply();
    $('apply').onclick = () => void apply();
    $('remove').onclick = () => void removeAll();
    $('undo').onclick = async () => { if (!undoSteps || busy) return; try { await s.undo(undoSteps); undoSteps = 0; reads.clear(); say('undone', {}, 'ok', 3000); repaint(); } catch (e) { say('failed', { e: errText(e) }, 'bad', 6000); } };
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
    tour ??= window.AddOnTour?.attach({
      button: $('help'), key: `${KEY}tourSeen`,
      labels: () => ({ next: t('tNext'), back: t('tBack'), skip: t('tSkip'), done: t('tDone') }),
      language: {
        sel: '#lang',
        list: () => Object.keys(I18N).map((c) => [c, I18N[c]._name]),
        current: () => lang,
        set: (c) => { $('lang').value = c; $('lang').dispatchEvent(new Event('change')); },
        title: () => t('langT'), text: () => t('langX'),
      },
      steps: () => [
        { sel: '#preset', title: () => t('q1t'), text: () => t('q1') },
        { sel: '#cards', title: () => t('q2t'), text: () => t('q2') },
        { sel: '#tbar', title: () => t('q3t'), text: () => t('q3') },
        { sel: '#apply', title: () => t('q4t'), text: () => t('q4') },
        { sel: '#tabs', title: () => t('q5t'), text: () => t('q5') },
        { sel: '#help', title: () => t('zt'), text: () => t('z') },
      ],
    });
  })();
})();

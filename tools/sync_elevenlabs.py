#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Automatyczny generator nagrań MP3 z ElevenLabs API (eleven_v4 ze znacznikami emocji [...])
dla kursu Git & GitHub Supervised Lab Engine.

Użycie:
  1. Klucz, Voice ID i Model ID wczytywane są automatycznie z pliku .env
  2. Testowe wygenerowanie tylko jednego kroku (np. m00_s01):
       python tools/sync_elevenlabs.py --only m00_s01
  3. Wygenerowanie całego kursu (wszystkie 136 plików MP3):
       python tools/sync_elevenlabs.py
"""
import os
import re
import sys
import json
import hashlib
import pathlib
import subprocess
import urllib.request
import urllib.error

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

ROOT = pathlib.Path(__file__).resolve().parent.parent
ENV_PATH = ROOT / ".env"
AUDIO_DIR = ROOT / "audio"
MANIFEST_PATH = AUDIO_DIR / "audio_manifest.json"


def load_dotenv(dotenv_path: pathlib.Path):
    if not dotenv_path.exists():
        return
    with open(dotenv_path, "r", encoding="utf-8") as f:
        for raw_line in f:
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            k = k.strip()
            v = v.strip().strip('"').strip("'")
            if k and k not in os.environ:
                os.environ[k] = v


load_dotenv(ENV_PATH)

API_KEY = os.environ.get("ELEVENLABS_API_KEY") or os.environ.get("XI_API_KEY") or "WPISZ_TUTAJ_SWOJ_KLUCZ_API"
VOICE_ID = os.environ.get("ELEVENLABS_VOICE_ID", "WPISZ_TUTAJ_ID_WYBRANEGO_GLOSU")
TASK_VOICE_ID = os.environ.get("ELEVENLABS_TASK_VOICE_ID", "N0GCuK2B0qwWozQNTS8F")
MODEL_ID = os.environ.get("ELEVENLABS_MODEL_ID", "eleven_v4")


def get_voice_id_for_audio(audio_id: str) -> str:
    """
    Dla dolnego lewego panelu z zadaniami (losowane otwarcia task_opener_*,
    instrukcje _task_guide oraz komunikat zaliczenia zadania step_completed)
    używamy głosu żeńskiego Magdalena (N0GCuK2B0qwWozQNTS8F).
    Pozostałe kwestie czyta główny lektor.
    """
    if audio_id.startswith("task_opener_") or audio_id.endswith("_task_guide") or audio_id == "step_completed":
        return TASK_VOICE_ID
    return VOICE_ID


def decorate_for_eleven_v4(audio_id: str, raw_text: str) -> str:
    """
    Dodaje znaczniki reżyserskie i artykulacyjne [...] dla modelu eleven_v4,
    zachowując naturalny rytm wykładu, pauzy i emocje dopasowane do kontekstu.
    """
    text = raw_text.strip()
    if text.startswith("["):
        return text

    lower = text.lower()

    # 1. Dobór otwierającego znacznika emocji zależnie od roli fragmentu
    if audio_id == "voice_selected":
        opener = "[cheerfully, warmly]"
    elif audio_id == "step_completed" or audio_id.startswith("task_opener_") or audio_id.endswith("_task_guide"):
        opener = "[calm, matter-of-fact]"
    elif audio_id.endswith("_b01"):
        if "witaj" in lower or "gratulacje" in lower:
            opener = "[warmly, enthusiastically]"
        else:
            opener = "[engaging, professional]"
    elif any(w in lower for w in ("uwaga", "konflikt", "błąd", "zgub", "strac", "niebezpiecz", "katastrof", "ostrożnie")):
        opener = "[serious, attentive]"
    elif any(w in lower for w in ("ratunek", "spokojnie", "na szczęście", "bezpieczn", "odzyska")):
        opener = "[relieved, confident]"
    elif "?" in text:
        opener = "[curious, engaging]"
    else:
        opener = "[calm, explanatory]"

    # 2. Korekta ortofoniczna biernika "tę" przed spółgłoską dla modelu eleven_v4:
    # W pisowni na ekranie zachowujemy wzorcowe "tę" (np. "tę samą treść", "tę wersję"),
    # natomiast w strumieniu fonetycznym dla syntezatora zamieniamy wygłosowe "-ę" w zaimku "tę"
    # na ustne "te", zgodnie z wzorcową wymową polską ([te samą]). Zapobiega to zjawisku
    # wstecznej asymilacji nosowości do "-ą" w wyrazie "samą", które brzmiało jak potoczne "tą".
    text = re.sub(r"(^|(?<=\s))tę(?=\s)", "te", text)
    text = re.sub(r"(^|(?<=\s))Tę(?=\s)", "Te", text)
    # Zapobiegaj podwójnemu odczytaniu "dwukropek dwukropek" przy zapisie "dwukropek :plan.txt"
    text = text.replace("dwukropek :plan.txt", "dwukropek plan.txt")

    # 3. Wstawienie naturalnych mikro-pauz i akcentów w środku wypowiedzi
    # Pauza po pierwszym zdaniu wprowadzającym w zadaniu praktycznym
    if audio_id.endswith("_task_guide"):
        text = text.replace(
            ". Wpisz w terminalu",
            ". [short pause] Wpisz w terminalu"
        )
    else:
        # Subtelny akcent przed kluczowymi zwrotami dydaktycznymi
        for cue in ("Spójrz na ", "Zauważ, że ", "Pamiętaj jednak", "W rezultacie ", "Dlatego ", "Pod maską "):
            if cue in text:
                text = text.replace(cue, f"[short pause] [emphatically] {cue}", 1)
                break

    return f"{opener} {text}"


def extract_all_effective_beats():
    """
    Używa silnika JS (App.getEffectiveBeats), aby wyciągnąć 100% kwestii audio
    dokładnie w takiej postaci, w jakiej odtwarza je aplikacja (wraz z podsumowaniem zadania).
    """
    node_script = r"""
    const fs = require("fs");
    const vm = require("vm");
    const currFiles = fs.readdirSync("curriculum").filter(f => f.endsWith(".js")).sort();
    const allCode = [
      ...currFiles.map(f => fs.readFileSync("curriculum/" + f, "utf8")),
      fs.readFileSync("engine/vfs-git.js", "utf8"),
      fs.readFileSync("engine/storage-scorm.js", "utf8"),
      fs.readFileSync("engine/app.js", "utf8"),
      "App;"
    ].join("\n");
    const ctx = {
      window: { addEventListener: () => {}, location: { search: "", href: "http://localhost/index.html" }, CURRICULUM: [] },
      document: { getElementById: () => null, querySelectorAll: () => [] },
      localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
      sessionStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
      navigator: {},
      URLSearchParams, Set, BigInt, console
    };
    const App = vm.runInNewContext(allCode, ctx);
    App.rebuildActiveCurriculum();
    const out = [
      {
        stepId: "global",
        audioId: "step_completed",
        text: "Zadanie praktyczne zostało zaliczone. Kliknij przycisk Następny krok."
      },
      {
        stepId: "global",
        audioId: "voice_selected",
        text: "Wybrano profesjonalny głos studyjny ElevenLabs. Kliknij przycisk Start, aby rozpocząć naukę."
      }
    ];
    for (const op of (App.taskGuideOpeners || [])) {
      out.push({
        stepId: "task_openers",
        audioId: op.id,
        text: op.text + "."
      });
    }
    for (const step of App.rawSteps) {
      const tier = App.getStepEffectiveTier(step);
      const beats = App.getEffectiveBeats(step);
      for (const b of beats) {
        if (b.audioId && (b.taskBodyText || b.voiceText)) {
          out.push({
            stepId: step.id,
            tier: tier,
            audioId: b.audioId,
            text: b.taskBodyText || b.voiceText
          });
        }
      }
    }
    process.stdout.write(JSON.stringify(out));
    """
    res = subprocess.run(
        ["node", "-e", node_script],
        cwd=str(ROOT),
        capture_output=True,
        text=True,
        encoding="utf-8",
        check=True
    )
    return json.loads(res.stdout)


def generate_mp3(text: str, out_path: pathlib.Path, voice_id: str = VOICE_ID):
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
    payload = json.dumps({
        "text": text,
        "model_id": MODEL_ID
    }).encode("utf-8")

    req = urllib.request.Request(url, data=payload, method="POST")
    req.add_header("xi-api-key", API_KEY)
    req.add_header("Content-Type", "application/json")
    req.add_header("Accept", "audio/mpeg")

    with urllib.request.urlopen(req) as resp:
        with open(out_path, "wb") as f:
            f.write(resp.read())


def main():
    args = sys.argv[1:]
    only_filters = []
    tier_filters = []
    for flag in ("--only", "--step"):
        if flag in args:
            idx = args.index(flag)
            if idx + 1 < len(args):
                only_filters.extend([tok.strip() for tok in args[idx + 1].split(",") if tok.strip()])
    if "--tier" in args:
        idx = args.index("--tier")
        if idx + 1 < len(args):
            tier_filters.extend([tok.strip() for tok in args[idx + 1].split(",") if tok.strip()])

    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    manifest = {}
    if MANIFEST_PATH.exists():
        with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
            manifest = json.load(f)

    beats = extract_all_effective_beats()
    if tier_filters:
        beats = [
            b for b in beats
            if b.get("stepId") in ("global", "task_openers") or b.get("tier") in tier_filters
        ]
    if only_filters:
        beats = [
            b for b in beats
            if any(f in b["stepId"] or f in b["audioId"] for f in only_filters)
        ]

    decorated_items = []
    for b in beats:
        expressive_text = decorate_for_eleven_v4(b["audioId"], b["text"]) if "v4" in MODEL_ID or "v3" in MODEL_ID else b["text"]
        decorated_items.append({**b, "ttsText": expressive_text})

    total_chars = sum(len(b["ttsText"]) for b in decorated_items)
    print(f"[*] Model: {MODEL_ID} | Głos wykładu: {VOICE_ID} | Głos zadań (Magdalena): {TASK_VOICE_ID}")
    print(f"[*] Kwestii do przetworzenia: {len(decorated_items)} (łącznie {total_chars} znaków ze znacznikami [...]).")

    key_ready = bool(API_KEY and not API_KEY.startswith("WPISZ_"))
    voice_ready = bool(VOICE_ID and not VOICE_ID.startswith("WPISZ_"))

    generated_count = 0
    skipped_count = 0

    for idx, item in enumerate(decorated_items, 1):
        audio_id = item["audioId"]
        tts_text = item["ttsText"]
        item_voice_id = get_voice_id_for_audio(audio_id)
        voice_scoped_str = f"{item_voice_id}:{MODEL_ID}:{tts_text}"
        text_hash = hashlib.sha1(voice_scoped_str.encode("utf-8")).hexdigest()
        mp3_path = AUDIO_DIR / f"{audio_id}.mp3"

        if manifest.get(audio_id) == text_hash and mp3_path.exists():
            skipped_count += 1
            continue

        if not key_ready or not voice_ready:
            print(f"  [DO WYGENEROWANIA] {audio_id:<22} ({len(tts_text):>3} zn.) -> {tts_text[:70]}...")
            continue

        print(f"  [{idx}/{len(decorated_items)}] {audio_id}.mp3 [voice={item_voice_id[:6]}] ({len(tts_text)} zn.) -> {tts_text[:54]}...")
        try:
            generate_mp3(tts_text, mp3_path, voice_id=item_voice_id)
            manifest[audio_id] = text_hash
            generated_count += 1
            with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
                json.dump(manifest, f, indent=2, ensure_ascii=False)
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8", errors="replace")
            print(f"[BŁĄD HTTP {e.code}] Przy generowaniu {audio_id}: {err_body}")
            sys.exit(1)

    if not key_ready or not voice_ready:
        print("\n[!] Aby wygenerować pliki MP3, uzupełnij ELEVENLABS_API_KEY oraz ELEVENLABS_VOICE_ID w pliku .env.")
    else:
        print(f"\n[OK] Synchronizacja zakończona (Wygenerowano: {generated_count}, Pominięto aktualnych: {skipped_count}).")


if __name__ == "__main__":
    main()

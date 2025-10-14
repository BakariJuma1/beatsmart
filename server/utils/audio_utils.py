from pydub import AudioSegment
import tempfile
import os

PREVIEW_DURATION_MS = 30 * 1000 

def create_preview(file_storage, start_time=0):
  
    try:
        
        audio = AudioSegment.from_file(file_storage)

        start_ms = start_time * 1000
        end_ms = start_ms + PREVIEW_DURATION_MS
        if end_ms > len(audio):
            end_ms = len(audio)

        preview = audio[start_ms:end_ms]

        
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3")
        preview.export(temp_file.name, format="mp3")
        return temp_file.name
    except Exception as e:
        print("Preview generation failed:", e)
        return None

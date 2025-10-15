import ffmpeg
import tempfile

PREVIEW_DURATION_MS = 30 * 1000
def create_preview(file_storage, start_time=0):
    try:
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3")

        (
            ffmpeg
            .input(file_storage, ss=start_time, t=PREVIEW_DURATION_MS / 1000)
            .output(temp_file.name, format='mp3', acodec='libmp3lame')
            .overwrite_output()
            .run(quiet=True)
        )

        return temp_file.name
    except Exception as e:
        print("Preview generation failed:", e)
        return None

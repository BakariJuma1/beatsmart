# seed.py
from datetime import datetime
from server.extension import db
from server.models import User, Beat, BeatFile, ContractTemplate, Wishlist, SoundPack

# Clear existing data (optional, be careful in production)
def clear_db():
    db.session.query(Wishlist).delete()
    db.session.query(BeatFile).delete()
    db.session.query(ContractTemplate).delete()
    db.session.query(Beat).delete()
    db.session.query(SoundPack).delete()
    db.session.query(User).delete()
    db.session.commit()

def seed_users():
    users = [
        User(name="Bakari Juma", email="bakari@example.com", role="producer"),
        User(name="Alice Artist", email="alice@example.com", role="buyer"),
        User(name="John Doe", email="john@example.com", role="buyer"),
    ]
    db.session.add_all(users)
    db.session.commit()
    print("Users seeded")
    return users
def seed_beats(producer):
    beats = [
        Beat(title="Afrobeat Vibes", description="A groovy afrobeat tune", genre="Afrobeat", bpm=100, key="C# minor", price=50.0, cover_url="/covers/afrobeat1.jpg", preview_url="/previews/afrobeat1.mp3", producer=producer),
        Beat(title="Hip Hop Hustle", description="Hard hitting hip hop beat", genre="Hip Hop", bpm=85, key="E minor", price=40.0, cover_url="/covers/hiphop1.jpg", preview_url="/previews/hiphop1.mp3", producer=producer),
        Beat(title="Dancehall Groove", description="Smooth dancehall rhythm", genre="Dancehall", bpm=95, key="F major", price=60.0, cover_url="/covers/dancehall1.jpg", preview_url="/previews/dancehall1.mp3", producer=producer),
        Beat(title="Lo-Fi Chill", description="Relaxing lo-fi beats for study", genre="Lo-Fi", bpm=70, key="A minor", price=30.0, cover_url="/covers/lofi1.jpg", preview_url="/previews/lofi1.mp3", producer=producer),
        Beat(title="Trap Madness", description="Energetic trap beat", genre="Trap", bpm=140, key="G minor", price=55.0, cover_url="/covers/trap1.jpg", preview_url="/previews/trap1.mp3", producer=producer),
        Beat(title="RnB Smooth", description="Smooth RnB vibes", genre="RnB", bpm=90, key="D major", price=45.0, cover_url="/covers/rnb1.jpg", preview_url="/previews/rnb1.mp3", producer=producer),
        Beat(title="Reggae Sunset", description="Laid back reggae beat", genre="Reggae", bpm=80, key="C major", price=35.0, cover_url="/covers/reggae1.jpg", preview_url="/previews/reggae1.mp3", producer=producer),
    ]
    db.session.add_all(beats)
    db.session.commit()
    print("7 Beats seeded")
    return beats


def seed_beat_files(beats):
    files = []
    for beat in beats:
        files.append(
            BeatFile(
                file_type="mp3",
                file_url=f"/files/{beat.title.replace(' ', '_').lower()}.mp3",
                price=beat.price,
                beat=beat
            )
        )
        files.append(
            BeatFile(
                file_type="wav",
                file_url=f"/files/{beat.title.replace(' ', '_').lower()}.wav",
                price=beat.price + 20,
                beat=beat
            )
        )
    db.session.add_all(files)
    db.session.commit()
    print("BeatFiles seeded")

def seed_contract_templates(beats):
    templates = []
    for beat in beats:
        templates.append(
            ContractTemplate(
                beat=beat,
                file_type="pdf",
                contract_type="Standard License",
                terms=f"Standard license terms for {beat.title}",
                price=beat.price,
                contract_url=f"/contracts/{beat.title.replace(' ', '_').lower()}.pdf"
            )
        )
    db.session.add_all(templates)
    db.session.commit()
    print("ContractTemplates seeded")

def seed_wishlists(users, beats):
    # Add first beat to Alice's wishlist
    wishlist = Wishlist(user=users[1], item_type="beat", item_id=beats[0].id)
    db.session.add(wishlist)
    db.session.commit()
    print("Wishlists seeded")

def seed_soundpacks(producer):
    soundpacks = [
        SoundPack(
            name="Ultimate Drum Kit",
            description="All your drum needs",
            price=80,
            cover_url="/covers/drumkit.jpg",
            file_url="/soundpacks/drumkit.zip",
            producer=producer
        )
    ]
    db.session.add_all(soundpacks)
    db.session.commit()
    print("SoundPacks seeded")

if __name__ == "__main__":
    clear_db()
    users = seed_users()
    beats = seed_beats(users[0])
    seed_beat_files(beats)
    seed_contract_templates(beats)
    seed_wishlists(users, beats)
    seed_soundpacks(users[0])
    print("Seeding complete!")

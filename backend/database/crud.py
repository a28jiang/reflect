from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from . import models, schemas


def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()


def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()


def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()


def create_user(db: Session, user: schemas.UserCreate):
    fake_hashed_password = user.password + "notreallyhashed"
    db_user = models.User(email=user.email, hashed_password=fake_hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_items(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Item).offset(skip).limit(limit).all()


def create_user_item(db: Session, item: schemas.ItemCreate, user_id: int):
    db_item = models.Item(**item.model_dump(), owner_id=user_id)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


def create_outfit(db: Session, outfit: schemas.OutfitCreate, user_id: int):
    db_outfit = models.Outfit(**outfit.model_dump(), owner_id=user_id)
    db.add(db_outfit)
    db.commit()
    db.refresh(db_outfit)
    return db_outfit


def get_outfit(db: Session, outfit_id: int):
    return db.query(models.Outfit).filter(models.Outfit.id == outfit_id).first()


def get_all_outfits(db: Session, user_id: int, limit: int = 100):
    return (
        db.query(models.Outfit)
        .filter(models.Outfit.owner_id == user_id)
        .limit(limit)
        .all()
    )


def create_entry(db: Session, entry: schemas.EntryCreate):
    db_entry = models.Entry(**entry.model_dump())
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry


def get_entry(db: Session, entry_id: int):
    return db.query(models.Entry).filter(models.Entry.id == entry_id).first()


def update_entry_outfit_id(db: Session, entry_id: int, outfit_id: int):
    # Check if the entry exists
    db_entry = get_entry(db, entry_id)
    if db_entry is None:
        return None  # Entry not found

    # Check if the specified outfit_id exists
    db_outfit = get_outfit(db, outfit_id)
    if db_outfit is None:
        return None  # Outfit not found

    try:
        # Update the outfit_id for the entry
        db_entry.outfit_id = outfit_id
        db.commit()
        db.refresh(db_entry)
        return db_entry
    except IntegrityError:
        # IntegrityError may occur if the new outfit_id violates constraints
        db.rollback()
        return None

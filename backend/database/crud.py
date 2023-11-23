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

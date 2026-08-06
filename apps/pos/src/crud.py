from sqlalchemy.orm import Session
from datetime import datetime

from . import models, schemas
from .auth import get_password_hash


# ─── User ───
def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()


def create_user(db: Session, user: schemas.UserCreate, tenant_id: int):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
        role=user.role,
        tenant_id=tenant_id
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


# ─── Tenant ───
def create_tenant(db: Session, tenant: schemas.TenantCreate):
    db_tenant = models.Tenant(**tenant.dict())
    db.add(db_tenant)
    db.commit()
    db.refresh(db_tenant)
    return db_tenant


def get_tenant_by_slug(db: Session, slug: str):
    return db.query(models.Tenant).filter(models.Tenant.slug == slug).first()


# ─── Menu Category ───
def get_categories(db: Session, tenant_id: int):
    return db.query(models.MenuCategory).filter(
        models.MenuCategory.tenant_id == tenant_id,
        models.MenuCategory.is_active == True
    ).order_by(models.MenuCategory.sort_order).all()


def create_category(db: Session, category: schemas.CategoryCreate, tenant_id: int):
    db_category = models.MenuCategory(**category.dict(), tenant_id=tenant_id)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


def update_category(db: Session, category_id: int, category: schemas.CategoryUpdate, tenant_id: int):
    db_category = db.query(models.MenuCategory).filter(
        models.MenuCategory.id == category_id,
        models.MenuCategory.tenant_id == tenant_id
    ).first()
    if not db_category:
        return None
    update_data = category.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_category, key, value)
    db.commit()
    db.refresh(db_category)
    return db_category


def delete_category(db: Session, category_id: int, tenant_id: int):
    db_category = db.query(models.MenuCategory).filter(
        models.MenuCategory.id == category_id,
        models.MenuCategory.tenant_id == tenant_id
    ).first()
    if not db_category:
        return None
    # Unassign items from this category
    db.query(models.MenuItem).filter(
        models.MenuItem.category_id == category_id,
        models.MenuItem.tenant_id == tenant_id
    ).update({"category_id": None})
    db.delete(db_category)
    db.commit()
    return True


# ─── Table ───
def get_tables(db: Session, tenant_id: int):
    return db.query(models.Table).filter(models.Table.tenant_id == tenant_id).all()


def create_table(db: Session, table: schemas.TableCreate, tenant_id: int):
    db_table = models.Table(**table.dict(), tenant_id=tenant_id)
    db.add(db_table)
    db.commit()
    db.refresh(db_table)
    return db_table


def update_table(db: Session, table_id: int, table: schemas.TableUpdate, tenant_id: int):
    db_table = db.query(models.Table).filter(
        models.Table.id == table_id,
        models.Table.tenant_id == tenant_id
    ).first()
    if not db_table:
        return None
    update_data = table.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_table, key, value)
    db.commit()
    db.refresh(db_table)
    return db_table


def delete_table(db: Session, table_id: int, tenant_id: int):
    db_table = db.query(models.Table).filter(
        models.Table.id == table_id,
        models.Table.tenant_id == tenant_id
    ).first()
    if not db_table:
        return None
    db.delete(db_table)
    db.commit()
    return True


def update_table_status(db: Session, table_id: int, status: models.TableStatus):
    db_table = db.query(models.Table).filter(models.Table.id == table_id).first()
    if db_table:
        db_table.status = status
        db.commit()
        db.refresh(db_table)
    return db_table


# ─── Menu ───
def get_menu(db: Session, tenant_id: int):
    items = db.query(models.MenuItem).filter(
        models.MenuItem.tenant_id == tenant_id,
        models.MenuItem.is_available == True
    ).order_by(models.MenuItem.sort_order).all()

    categories = db.query(models.MenuCategory).filter(
        models.MenuCategory.tenant_id == tenant_id,
        models.MenuCategory.is_active == True
    ).order_by(models.MenuCategory.sort_order).all()

    return {
        "categories": categories,
        "items": items
    }


def create_menu_item(db: Session, item: schemas.MenuItemCreate, tenant_id: int):
    db_item = models.MenuItem(**item.dict(), tenant_id=tenant_id)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


def update_menu_item(db: Session, item_id: int, item: schemas.MenuItemUpdate):
    db_item = db.query(models.MenuItem).filter(models.MenuItem.id == item_id).first()
    if db_item:
        update_data = item.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_item, key, value)
        db.commit()
        db.refresh(db_item)
    return db_item


# ─── Order ───
def generate_order_number(db: Session, tenant_id: int) -> str:
    today = datetime.utcnow().strftime("%Y%m%d")
    count = db.query(models.Order).filter(
        models.Order.tenant_id == tenant_id,
        models.Order.created_at >= datetime.utcnow().replace(hour=0, minute=0, second=0)
    ).count()
    return f"ORD-{today}-{count + 1:04d}"


def create_order(db: Session, order: schemas.OrderCreate, user_id: int, tenant_id: int):
    order_number = generate_order_number(db, tenant_id)

    # Calculate totals
    subtotal = 0.0
    items_data = []
    for item in order.items:
        menu_item = db.query(models.MenuItem).filter(models.MenuItem.id == item.menu_item_id).first()
        if not menu_item:
            continue
        total_price = item.unit_price * item.quantity
        subtotal += total_price
        items_data.append({
            "menu_item_id": item.menu_item_id,
            "quantity": item.quantity,
            "unit_price": item.unit_price,
            "total_price": total_price,
            "notes": item.notes,
            "modifiers": item.modifiers
        })

    tax = subtotal * 0.10  # 10% IVA
    total = subtotal + tax

    db_order = models.Order(
        order_number=order_number,
        tenant_id=tenant_id,
        user_id=user_id,
        table_id=order.table_id,
        status=models.OrderStatus.PENDING,
        subtotal=subtotal,
        tax=tax,
        total=total,
        payment_method=order.payment_method,
        notes=order.notes,
        source=order.source
    )
    db.add(db_order)
    db.flush()

    for item_data in items_data:
        db_item = models.OrderItem(**item_data, order_id=db_order.id)
        db.add(db_item)

    # Update table status if table is assigned
    if order.table_id:
        update_table_status(db, order.table_id, models.TableStatus.OCCUPIED)

    db.commit()
    db.refresh(db_order)
    return db_order


def get_order(db: Session, order_id: int):
    return db.query(models.Order).filter(models.Order.id == order_id).first()


def get_orders_by_tenant(db: Session, tenant_id: int, status: str = None):
    query = db.query(models.Order).filter(models.Order.tenant_id == tenant_id)
    if status:
        query = query.filter(models.Order.status == status)
    return query.order_by(models.Order.created_at.desc()).all()


def close_order(db: Session, order_id: int):
    db_order = get_order(db, order_id)
    if db_order:
        db_order.status = models.OrderStatus.PAID
        db_order.closed_at = datetime.utcnow()
        if db_order.table_id:
            update_table_status(db, db_order.table_id, models.TableStatus.FREE)
        db.commit()
        db.refresh(db_order)
    return db_order


# ─── Inventory ───
def get_inventory(db: Session, tenant_id: int):
    return db.query(models.InventoryItem).filter(
        models.InventoryItem.tenant_id == tenant_id
    ).all()


def create_inventory_item(db: Session, item: schemas.InventoryItemCreate, tenant_id: int):
    db_item = models.InventoryItem(**item.dict(), tenant_id=tenant_id)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


def update_stock(db: Session, item_id: int, quantity: float, type: str, notes: str = ""):
    item = db.query(models.InventoryItem).filter(models.InventoryItem.id == item_id).first()
    if not item:
        return None

    if type == "in":
        item.current_stock += quantity
        item.last_restocked = datetime.utcnow()
    elif type in ["out", "waste"]:
        item.current_stock -= quantity

    movement = models.StockMovement(
        inventory_item_id=item_id,
        type=type,
        quantity=quantity,
        notes=notes
    )
    db.add(movement)
    db.commit()
    db.refresh(item)
    return item


def get_low_stock_items(db: Session, tenant_id: int):
    return db.query(models.InventoryItem).filter(
        models.InventoryItem.tenant_id == tenant_id,
        models.InventoryItem.current_stock <= models.InventoryItem.min_stock
    ).all()

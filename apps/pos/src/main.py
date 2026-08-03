from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from contextlib import asynccontextmanager

from . import models, schemas, crud
from .database import engine, get_db
from .auth import get_current_user, create_access_token
from .integrations import ChatBridge, GuardBridge

models.Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    yield
    # Shutdown


app = FastAPI(
    title="Host.ia POS API",
    description="Free, open-source point-of-sale for hospitality",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Auth ───
@app.post("/v1/auth/login", response_model=schemas.Token)
def login(email: str, password: str, db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, email)
    if not user or not crud.verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/v1/auth/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, tenant_slug: str, db: Session = Depends(get_db)):
    tenant = crud.get_tenant_by_slug(db, tenant_slug)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    db_user = crud.get_user_by_email(db, user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db, user, tenant.id)


# ─── Tables ───
@app.get("/v1/tables", response_model=list[schemas.TableResponse])
def get_tables(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return crud.get_tables(db, current_user.tenant_id)


@app.post("/v1/tables", response_model=schemas.TableResponse)
def create_table(
    table: schemas.TableCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return crud.create_table(db, table, current_user.tenant_id)


# ─── Menu ───
@app.get("/v1/menu")
def get_menu(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return crud.get_menu(db, current_user.tenant_id)


@app.post("/v1/menu", response_model=schemas.MenuItemResponse)
def create_menu_item(
    item: schemas.MenuItemCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return crud.create_menu_item(db, item, current_user.tenant_id)


@app.put("/v1/menu/{item_id}", response_model=schemas.MenuItemResponse)
def update_menu_item(
    item_id: int,
    item: schemas.MenuItemUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return crud.update_menu_item(db, item_id, item)


# ─── Orders ───
@app.post("/v1/orders", response_model=schemas.OrderResponse)
def create_order(
    order: schemas.OrderCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return crud.create_order(db, order, current_user.id, current_user.tenant_id)


@app.get("/v1/orders", response_model=list[schemas.OrderResponse])
def get_orders(
    status: str = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return crud.get_orders_by_tenant(db, current_user.tenant_id, status)


@app.get("/v1/orders/{order_id}", response_model=schemas.OrderResponse)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    order = crud.get_order(db, order_id)
    if not order or order.tenant_id != current_user.tenant_id:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@app.post("/v1/orders/{order_id}/close", response_model=schemas.OrderResponse)
def close_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    order = crud.get_order(db, order_id)
    if not order or order.tenant_id != current_user.tenant_id:
        raise HTTPException(status_code=404, detail="Order not found")
    return crud.close_order(db, order_id)


# ─── Inventory ───
@app.get("/v1/inventory", response_model=list[schemas.InventoryItemResponse])
def get_inventory(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return crud.get_inventory(db, current_user.tenant_id)


@app.post("/v1/inventory", response_model=schemas.InventoryItemResponse)
def create_inventory_item(
    item: schemas.InventoryItemCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return crud.create_inventory_item(db, item, current_user.tenant_id)


@app.post("/v1/inventory/{item_id}/stock")
def update_stock(
    item_id: int,
    quantity: float,
    type: str,
    notes: str = "",
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    item = crud.update_stock(db, item_id, quantity, type, notes)
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    return item


@app.get("/v1/inventory/low-stock", response_model=list[schemas.InventoryItemResponse])
def get_low_stock(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return crud.get_low_stock_items(db, current_user.tenant_id)


# ─── Health ───
@app.get("/health")
def health():
    return {"status": "ok", "service": "pos"}

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy import Text
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import hashes, serialization
import bcrypt

SQLALCHEMY_DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/seguridad_db"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

#modelo de bdd
class Usuario(Base):
    __tablename__ = "usuarios"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    nota = Column(String)   

class RegistroCripto(Base):
    __tablename__ = "registros_cripto"
    id = Column(Integer, primary_key=True, index=True)
    metodo = Column(String) # AES, RSA, Vigenere, Hash
    data_original = Column(String)
    resultado = Column(String)
Base.metadata.create_all(bind=engine)

key_aes = Fernet.generate_key()
cipher_aes = Fernet(key_aes)

app = FastAPI(title="Proyecto Final - Seguridad")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

#AES
key_aes = Fernet.generate_key()
cipher_aes = Fernet(key_aes)

#RSA
private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
public_key = private_key.public_key()

#Hashing con salt
@app.post("/hash-password")
def hash_password(password: str, db: Session = Depends(get_db)):
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode(), salt)
    password_hashed = hashed.decode()
    nuevo_reg = RegistroCripto(metodo="Hash (bcrypt)", data_original="***" , resultado=password_hashed)
    db.add(nuevo_reg)
    db.commit()
    return {"password_hashed": password_hashed}

# Criptograía
# cifrado simetrico aes
@app.post("/encrypt/aes")
def encrypt_aes(data: str, db: Session = Depends(get_db)):
    encrypted = cipher_aes.encrypt(data.encode())
    encrypted_data = encrypted.decode()
    nuevo_reg = RegistroCripto(metodo="AES", data_original=data, resultado=encrypted_data)
    db.add(nuevo_reg)
    db.commit()
    return {"encrypted_data": encrypted_data}

# cifrado asimetrico rsa
@app.post("/encrypt/rsa")
def encrypt_rsa(data: str, db: Session = Depends(get_db)):
    encrypted = public_key.encrypt(
        data.encode(),
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None
        )
    )
    encrypted_data_hex = encrypted.hex()
    nuevo_reg = RegistroCripto(metodo="RSA", data_original=data, resultado=encrypted_data_hex)
    db.add(nuevo_reg)
    db.commit()
    return {"encrypted_data_hex": encrypted_data_hex} 

# cifrado clasido de vigenere
@app.get("/encrypt/vigenere")
def vigenere_cipher(text: str, key: str, decode: bool = False, db: Session = Depends(get_db)):
    result = ""
    key_indices = [ord(k.lower()) - 97 for k in key]
    for i, char in enumerate(text):
        if char.isalpha():
            offset = 97 if char.islower() else 65
            shift = key_indices[i % len(key)]
            if decode: shift = -shift
            result += chr((ord(char) - offset + shift) % 26 + offset)
        else:
            result += char
    nuevo_reg = RegistroCripto(metodo="Vigenere", data_original=text, resultado=result)
    db.add(nuevo_reg)
    db.commit()
    return {"result": result}

#Crud
db_usuarios = []
@app.post("/usuarios")
def crear_usuario(username: str, nota_sensible: str, db: Session = Depends(get_db)):
    # Ciframos la nota
    nota_cifrada = cipher_aes.encrypt(nota_sensible.encode()).decode()
    
    # CREAR EL OBJETO PARA LA BASE DE DATOS
    nuevo_usuario = Usuario(username=username, nota=nota_cifrada)
    
    # GUARDAR EN POSTGRES (Esto es lo que faltaba)
    db.add(nuevo_usuario)
    db.commit() # Confirma los cambios en la BDD
    db.refresh(nuevo_usuario) # Recarga los datos desde la BDD
    
    return {"status": "Usuario creado en Postgres", "data": {"username": username, "nota": nota_cifrada}}

@app.get("/usuarios")
def listar_usuarios(db: Session = Depends(get_db)):
    # Consultamos todos los registros de la tabla
    usuarios = db.query(Usuario).all()
    return usuarios

@app.get("/usuarios/{username}")
def buscar_usuario(username: str, db: Session = Depends(get_db)):
    # Buscamos por el campo username en la tabla
    usuario = db.query(Usuario).filter(Usuario.username == username).first()
    if usuario:
        return usuario
    return {"error": "Usuario no encontrado"}

@app.get("/decrypt/vigenere")
def vigenere_decipher(text: str, key: str):
    result = ""
    key_indices = [ord(k.lower()) - 97 for k in key]
    for i, char in enumerate(text):
        if char.isalpha():
            offset = 97 if char.islower() else 65
            shift = -key_indices[i % len(key)]  
            result += chr((ord(char) - offset + shift) % 26 + offset)
        else:
            result += char
    return {"result": result}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import hashes, serialization
import bcrypt

app = FastAPI(title="Proyecto Final - Seguridad")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
#AES
key_aes = Fernet.generate_key()
cipher_aes = Fernet(key_aes)

#RSA
private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
public_key = private_key.public_key()

#Hashing con salt
@app.post("/hash-password")
def hash_password(password: str):
    # bcrypt maneja el salt automáticamente 
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode(), salt)
    return {"password_hashed": hashed.decode()}

# Criptograía
# cifrado simetrico aes
@app.post("/encrypt/aes")
def encrypt_aes(data: str):
    encrypted = cipher_aes.encrypt(data.encode())
    return {"encrypted_data": encrypted.decode()}

# cifrado asimetrico rsa
@app.post("/encrypt/rsa")
def encrypt_rsa(data: str):
    encrypted = public_key.encrypt(
        data.encode(),
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None
        )
    )
    return {"encrypted_data_hex": encrypted.hex()}

# cifrado clasido de vigenere
@app.get("/encrypt/vigenere")
def vigenere_cipher(text: str, key: str, decode: bool = False):
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
    return {"result": result}

#Crud
db_usuarios = []
@app.post("/usuarios")
def crear_usuario(username: str, nota_sensible: str):
    nota_cifrada = cipher_aes.encrypt(nota_sensible.encode()).decode()
    user = {"username": username, "nota": nota_cifrada}
    db_usuarios.append(user)
    return {"status": "Usuario creado", "data": user}

@app.get("/usuarios")
def listar_usuarios():
    return db_usuarios

@app.get("/usuarios/{username}")
def buscar_usuario(username: str):
    for usuario in db_usuarios:
        if usuario["username"] == username:
            return usuario
    return {"error": "Usuario no encontrado"}

@app.get("/decrypt/vigenere")
def vigenere_decipher(text: str, key: str):
    # Reutiliza la misma función pero con decode=True
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
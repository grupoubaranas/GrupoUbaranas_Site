body {
  font-family: "Segoe UI", Arial, sans-serif;
  margin: 0;
  background: #f7f7f7;
  color: #333;
  scroll-behavior: smooth;
}

/* ==== Cabeçalho fixo ==== */
.site-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background: rgba(255,255,255,0.9);
  backdrop-filter: blur(8px);
  z-index: 1000;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  text-align: center;
  padding: 10px 0;
}

.logo-fixa {
  height: 110px;
  width: auto;
}

.slogan {
  font-size: 1rem;
  color: #444;
  margin-top: 5px;
}

/* ==== Estrutura principal ==== */
main {
  padding-top: 160px;
}

section {
  text-align: center;
  padding: 60px 20px;
  background: #fff;
  margin-bottom: 10px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0,0,0,0.05);
}

section:nth-child(even) {
  background: #f2f2f2;
}

/* ==== Títulos ==== */
.titulo-perigo {
  color: #d93025;
  font-size: 1.8rem;
}

.titulo-atenção {
  color: #e67e22;
  font-size: 1.8rem;
}

.titulo-solucao {
  color: #0056b3;
  font-size: 1.8rem;
}

p {
  max-width: 800px;
  margin: 15px auto;
  line-height: 1.6;
}

/* ==== Imagens ==== */
.imagem-ilustrativa {
  width: 100%;
  max-width: 500px;
  border-radius: 10px;
  margin: 20px 0;
}

.galeria {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin: 20px 0;
}

.galeria img {
  width: 45%;
  border-radius: 8px;
}

/* ==== Botões WhatsApp ==== */
.btn-whatsapp {
  display: inline-block;
  background: #25d366;
  color: white;
  padding: 12px 25px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: bold;
  transition: background 0.3s ease;
}

.btn-whatsapp:hover {
  background: #1ebe5d;
}

/* ==== Rodapé ==== */
footer {
  text-align: center;
  padding: 30px 0;
  background: #222;
  color: #eee;
  font-size: 0.9rem;
}

/* ==== Botão flutuante ==== */
.whatsapp-fixo {
  position: fixed;
  bottom: 25px;
  right: 25px;
  z-index: 9999;
  width: 65px;
  height: 65px;
  border-radius: 50%;
  background-color: #25d366;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  transition: transform 0.3s ease;
}

.whatsapp-fixo:hover {
  transform: scale(1.1);
}

.whatsapp-fixo img {
  width: 40px;
  height: 40px;
}

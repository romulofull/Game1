import React, { useState, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Text } from 'react-konva';
import pesas from './gallery/pesas.jpg';
import chatarra from './gallery/chatarra.jpg';
import jugador from './gallery/dibujo.jpg';

const ANCHO = window.innerWidth;
const ALTO = window.innerHeight;

const Juego = () => {
  const [tamañoJugador, setTamañoJugador] = useState(200);
  const [pesasdeEntrenamiento, setPesasdeEntrenamiento] = useState([]);
  const [comidaChatarra, setComidaChatarra] = useState([]);
  const [puntaje, setPuntaje] = useState(0);
  const [imagenPesasdeEntrenamiento, setImagenPesasdeEntrenamiento] = useState(null);
  const [imagenComidaChatarra, setImagenComidaChatarra] = useState(null);
  const [imagenJugador, setImagenJugador] = useState(null);
  const [posicionJugador, setPosicionJugador] = useState({ x: ANCHO / 2, y: ALTO / 2 });
  const [tiempoRestante, setTiempoRestante] = useState(1000);

  const generarPosicionAleatoria = () => {
    return {
      x: Math.random() * (ANCHO - 20) + 15,
      y: Math.random() * (ALTO - 20) + 15,
    };
  };

  const generarPesas = () => {
    const pesasGeneradas = [];
    while (pesasGeneradas.length < 5) {
      const nuevaPosicion = generarPosicionAleatoria();
      const colision = pesasGeneradas.some(p => 
        Math.abs(p.x - nuevaPosicion.x) < 20 && Math.abs(p.y - nuevaPosicion.y) < 20
      );
      if (!colision) {
        pesasGeneradas.push(nuevaPosicion);
      }
    }
    return pesasGeneradas;
  };

  const generarComidaChatarra = () => {
    const comidaGenerada = [];
    while (comidaGenerada.length < 5) {
      const nuevaPosicion = generarPosicionAleatoria();
      const colision = comidaGenerada.some(c => 
        Math.abs(c.x - nuevaPosicion.x) < 20 && Math.abs(c.y - nuevaPosicion.y) < 20
      );
      if (!colision) {
        comidaGenerada.push(nuevaPosicion);
      }
    }
    return comidaGenerada;
  };

  const verificarColisiones = () => {
    pesasdeEntrenamiento.forEach((peso, indice) => {
      if (colisionConJugador(peso)) {
        setPesasdeEntrenamiento(prev => prev.filter((_, i) => i !== indice));
        setTamañoJugador(tamañoJugador + 20);
        setPuntaje(puntaje + 1);
      }
    });

    comidaChatarra.forEach((comida, indice) => {
      if (colisionConJugador(comida)) {
        setTamañoJugador(tamañoJugador - 20);
        setPuntaje(puntaje - 1);
        setComidaChatarra(prev => prev.filter((_, i) => i !== indice));
      }
    });
  };

  const colisionConJugador = (objeto) => {
    return (
      posicionJugador.x < objeto.x + 60 &&
      posicionJugador.x + tamañoJugador > objeto.x &&
      posicionJugador.y < objeto.y + 60 &&
      posicionJugador.y + tamañoJugador > objeto.y
    );
  };

  useEffect(() => {
    setPesasdeEntrenamiento(generarPesas());
    setComidaChatarra(generarComidaChatarra());
    
    const cargarImagen = (src, setter) => {
      const img = new window.Image();
      img.src = src;
      img.onload = () => setter(img);
    };
    
    cargarImagen(pesas, setImagenPesasdeEntrenamiento);
    cargarImagen(chatarra, setImagenComidaChatarra);
    cargarImagen(jugador, setImagenJugador);

    const moverObjetos = setInterval(() => {
      setPesasdeEntrenamiento(prev => {
        const nuevosPesas = generarPesas();
        return [...prev, ...nuevosPesas].slice(0, 5);
      });
      setComidaChatarra(prev => {
        const nuevosComida = generarComidaChatarra();
        return [...prev, ...nuevosComida].slice(0, 5);
      });
    }, 4000);

    const temporizador = setInterval(() => {
      setTiempoRestante(prev => {
        if (prev <= 1) {
          clearInterval(temporizador);
          alert("¡Tiempo terminado!");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(moverObjetos);
      clearInterval(temporizador);
    };
  }, []);

  useEffect(() => {
    if (puntaje >= 10) {
      alert("¡Nivel Superado!");
      setPuntaje(0);
      setPesasdeEntrenamiento(generarPesas());
      setComidaChatarra(generarComidaChatarra());
      setTamañoJugador(200);
    }
  }, [puntaje]);

  const manejarTeclado = (e) => {
    const { key } = e;
    let nuevaPosicion = { ...posicionJugador };

    switch (key) {
      case 'ArrowUp':
        nuevaPosicion.y = Math.max(0, nuevaPosicion.y - 10);
        break;
      case 'ArrowDown':
        nuevaPosicion.y = Math.min(ALTO, nuevaPosicion.y + 10);
        break;
      case 'ArrowLeft':
        nuevaPosicion.x = Math.max(0, nuevaPosicion.x - 10);
        break;
      case 'ArrowRight':
        nuevaPosicion.x = Math.min(ANCHO, nuevaPosicion.x + 10);
        break;
      default:
        return; 
    }
    setPosicionJugador(nuevaPosicion);
    verificarColisiones();
  };

  useEffect(() => {
    window.addEventListener('keydown', manejarTeclado);
    return () => {
      window.removeEventListener('keydown', manejarTeclado);
    };
  }, [posicionJugador]);

 
  return (
    <Stage width={ANCHO} height={ALTO}>
      <Layer>
        {imagenJugador && (
          <KonvaImage
            x={posicionJugador.x}
            y={posicionJugador.y}
            width={tamañoJugador}
            height={tamañoJugador}
            image={imagenJugador}
          />
        )}
        {pesasdeEntrenamiento.map((peso, indice) => (
          <KonvaImage
            key={indice}
            x={peso.x}
            y={peso.y}
            width={60}
            height={60}
            image={imagenPesasdeEntrenamiento}
          />
        ))}
        {comidaChatarra.map((comida, indice) => (
          <KonvaImage
            key={indice}
            x={comida.x}
            y={comida.y}
            width={60}
            height={60}
            image={imagenComidaChatarra}
          />
        ))}
        <Text
          text={`Puntaje: ${puntaje}`}
          x={ANCHO - 150}
          y={20}
          fontSize={24}
          fill="black"
          align="right"
        />
        <Text
          text={`Tiempo: ${Math.floor(tiempoRestante / 60)}:${(tiempoRestante % 60).toString().padStart(2, '0')}`}
          x={ANCHO - 150}
          y={50}
          fontSize={24}
          fill="black"
          align="right"
        />
      </Layer>
    </Stage>
  );
};

export default Juego;

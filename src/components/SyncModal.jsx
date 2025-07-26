// =======================================================================
// ARCHIVO: src/components/SyncModal.jsx
// VERSIÓN FINAL CON SERVIDOR TURN Y TIMEOUTS DE CONEXIÓN
// =======================================================================
import React, { useState, useEffect, useRef } from 'react';
import Peer from 'peerjs';
import QRCode from 'react-qr-code';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X, Wifi, ScanLine } from 'lucide-react';
import { db } from '../services/db';
import { useLocalization } from '../context/LanguageContext';

export default function SyncModal({ onClose, onDataSynced }) {
  const { t } = useLocalization();
  const [peerId, setPeerId] = useState('');
  const [status, setStatus] = useState('initializing');
  const [scanError, setScanError] = useState(null);
  const peerRef = useRef(null);
  const scannerRef = useRef(null);
  const connectionTimeoutRef = useRef(null);

  useEffect(() => {
    // ========= CAMBIO 1: Configuración de PeerJS con servidor TURN =========
    // Esto aumenta drásticamente la probabilidad de conexión a través de redes restrictivas.
    const peer = new Peer({
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          {
            urls: 'turn:openrelay.metered.ca:80',
            username: 'openrelayproject',
            credential: 'openrelayproject',
          },
        ],
      },
    });
    peerRef.current = peer;

    peer.on('open', (id) => {
      if (id) {
        setPeerId(id);
        setStatus('waiting');
      } else {
        setStatus('error');
        setScanError(t('syncPeerError'));
      }
    });
    
    peer.on('connection', (conn) => {
      clearTimeout(connectionTimeoutRef.current);
      setStatus('connected');
      conn.on('data', (data) => { setStatus('syncing'); onDataSynced(data); });
      conn.on('error', (err) => console.error('Error en conexión PeerJS (entrante):', err));
    });
    
    peer.on('error', (err) => {
      console.error('Error general de PeerJS:', err);
      setScanError(`${t('syncConnectionError')} (Tipo: ${err.type})`);
      setStatus('error');
    });

    return () => {
      if (peer) peer.destroy();
    };
  }, [onDataSynced, t]);

  useEffect(() => {
    if (status === 'scanning' && !scannerRef.current) {
      const config = { fps: 10, qrbox: 250, videoConstraints: { facingMode: "environment" } };
      const scanner = new Html5QrcodeScanner("qr-reader", config, false);
      scannerRef.current = scanner;

      const onScanSuccess = (decodedText) => {
        if (scannerRef.current) {
          scannerRef.current.clear().catch(e => console.error("Fallo al limpiar escáner", e));
          scannerRef.current = null;
        }
        
        setStatus('connecting');
        
        // ========= CAMBIO 2: Timeout para la conexión =========
        // Si no se conecta en 15 segundos, muestra un error.
        connectionTimeoutRef.current = setTimeout(() => {
            setStatus('error');
            setScanError(t('syncTimeoutError'));
        }, 15000);

        const conn = peerRef.current.connect(decodedText, { reliable: true });

        conn.on('open', async () => {
          clearTimeout(connectionTimeoutRef.current);
          setStatus('connected');
          const allProjects = await db.projects.toArray();
          conn.send({ projects: allProjects });
          onClose();
        });
        
        conn.on('error', (err) => {
            clearTimeout(connectionTimeoutRef.current);
            console.error('Error al establecer conexión:', err);
            setScanError(`${t('syncConnectionError')} (Tipo: ${err.type})`);
            setStatus('error');
        });
      };
      
      const onScanError = (error) => { /* Ignorar errores menores */ };
      
      scanner.render(onScanSuccess, onScanError);
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(e => console.error("Fallo al limpiar el escáner.", e));
        scannerRef.current = null;
      }
    };
  }, [status, onClose, t]);

  const handleStartScan = () => { setScanError(null); setStatus('scanning'); };
  const handleRetry = () => { window.location.reload(); }; // La forma más simple de reiniciar el estado de PeerJS

  const renderContent = () => {
    switch (status) {
      case 'initializing':
        return <p>{t('syncInitializing')}</p>;
      case 'waiting':
        return (
          <>
            <h4 className="font-bold mb-2">{t('syncShowQR')}</h4>
            <div className="p-4 bg-white rounded-lg">
              {peerId ? <QRCode value={peerId} /> : <p>{t('syncInitializing')}</p>}
            </div>
            <p className="my-4">{t('syncOr')}</p>
            <button onClick={handleStartScan} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg">
              <ScanLine size={18} /> {t('syncScanQR')}
            </button>
          </>
        );
      case 'scanning':
        return (
            <div>
                <p className="mb-4">{t('syncCameraHelp')}</p>
                <div id="qr-reader" style={{ width: '100%' }}></div>
            </div>
        );
      case 'connecting':
        return <p className="text-blue-500">{t('syncConnecting')}</p>;
      case 'connected':
        return <p className="text-green-500">{t('syncConnected')}</p>;
      case 'syncing':
        return <p className="text-blue-500">{t('syncReceiving')}</p>;
      // ========= CAMBIO 3: Estado de error con opción de reintentar =========
      case 'error':
        return (
            <div className="flex flex-col items-center gap-4">
                <p className="p-2 bg-red-100 text-red-700 rounded-md">{scanError || t('syncGenericError')}</p>
                <button onClick={handleRetry} className="bg-slate-200 text-slate-800 px-4 py-2 rounded-lg">Reintentar</button>
            </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md p-6 text-center">
        <header className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold flex items-center gap-2"><Wifi />{t('syncTitle')}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <X className="text-slate-600 dark:text-slate-300" />
          </button>
        </header>
        <div className="flex flex-col items-center">
            {renderContent()}
        </div>
      </div>
    </div>
  );
}
// =======================================================================
// ARCHIVO: src/components/SyncModal.jsx
// VERSIÓN CON MEJOR FEEDBACK DE CONEXIÓN Y MANEJO DE ERRORES
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
  // ========= CAMBIO 1: Añadido nuevo estado 'connecting' =========
  const [status, setStatus] = useState('initializing'); // initializing, waiting, scanning, connecting, connected, syncing
  const [scanError, setScanError] = useState(null);
  const peerRef = useRef(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    // Usamos un host y puerto públicos de PeerJS para mayor fiabilidad
    const peer = new Peer({
        host: 'peerjs.com',
        path: '/peerjs',
        secure: true,
        port: 443
    });
    peerRef.current = peer;

    peer.on('open', (id) => { setPeerId(id); setStatus('waiting'); });
    
    peer.on('connection', (conn) => {
      setStatus('connected');
      conn.on('data', (data) => { setStatus('syncing'); onDataSynced(data); });
      conn.on('error', (err) => console.error('Error en conexión PeerJS (entrante):', err));
    });
    
    // ========= CAMBIO 2: Capturar errores generales de PeerJS =========
    peer.on('error', (err) => {
      console.error('Error general de PeerJS:', err);
      // Errores comunes: 'network', 'peer-unavailable'
      setScanError(`${t('syncConnectionError')} (Tipo: ${err.type})`);
      setStatus('waiting'); // Volver al estado inicial para reintentar
    });

    return () => { peer.destroy(); };
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
        
        setStatus('connecting'); // ========= CAMBIO 3: Mostrar estado "Conectando..." =========
        
        const conn = peerRef.current.connect(decodedText);

        conn.on('open', async () => {
          setStatus('connected');
          const allProjects = await db.projects.toArray();
          conn.send({ projects: allProjects });
          onClose();
        });
        
        conn.on('error', (err) => {
            console.error('Error al establecer conexión:', err);
            setScanError(`${t('syncConnectionError')} (Tipo: ${err.type})`);
            setStatus('waiting'); // Volver al estado inicial si la conexión falla
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

  const renderContent = () => {
    switch (status) {
      case 'initializing':
        return <p>{t('syncInitializing')}</p>;
      case 'waiting':
        return (
          <>
            <h4 className="font-bold mb-2">{t('syncShowQR')}</h4>
            <div className="p-4 bg-white rounded-lg">
              {peerId && <QRCode value={peerId} />}
            </div>
            {scanError && <p className="p-2 bg-red-100 text-red-700 rounded-md my-4">{scanError}</p>}
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
      // ========= CAMBIO 4: Nuevo caso para el estado 'connecting' =========
      case 'connecting':
        return <p className="text-blue-500">Conectando con el otro dispositivo...</p>;
      case 'connected':
        return <p className="text-green-500">{t('syncConnected')}</p>;
      case 'syncing':
        return <p className="text-blue-500">{t('syncReceiving')}</p>;
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
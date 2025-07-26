// =======================================================================
// ARCHIVO: src/components/SyncModal.jsx
// VERSIÓN SIMPLIFICADA PARA SINCRONIZACIÓN CONTINUA
// =======================================================================
import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'react-qr-code';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X, Wifi, ScanLine } from 'lucide-react';
import { useLocalization } from '../context/LanguageContext';

export default function SyncModal({ peer, onConnectionEstablished, onClose }) {
  const { t } = useLocalization();
  const [peerId, setPeerId] = useState('');
  const [status, setStatus] = useState('initializing');
  const [scanError, setScanError] = useState(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (peer) {
      if (peer.id) {
        setPeerId(peer.id);
        setStatus('waiting');
      }
      peer.on('open', (id) => {
        setPeerId(id);
        setStatus('waiting');
      });
    }
  }, [peer]);

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
        const conn = peer.connect(decodedText, { reliable: true });
        onConnectionEstablished(conn); // Pasa la conexión a App.jsx
      };
      
      const onScanError = (error) => { /* Ignorar */ };
      
      scanner.render(onScanSuccess, onScanError);
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(e => console.error("Fallo al limpiar escáner.", e));
        scannerRef.current = null;
      }
    };
  }, [status, peer, onConnectionEstablished]);

  const handleStartScan = () => { setScanError(null); setStatus('scanning'); };
  const handleRetry = () => { window.location.reload(); };

  const renderContent = () => {
    // ... (renderContent es similar, pero sin los estados 'connected', 'syncing', 'synced')
    switch (status) {
        case 'initializing': return <p>{t('syncInitializing')}</p>;
        case 'waiting': return (
            <>
                <h4 className="font-bold mb-2">{t('syncShowQR')}</h4>
                <div className="p-4 bg-white rounded-lg">{peerId ? <QRCode value={peerId} /> : <p>{t('syncInitializing')}</p>}</div>
                <p className="my-4">{t('syncOr')}</p>
                <button onClick={handleStartScan} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg"><ScanLine size={18} /> {t('syncScanQR')}</button>
            </>
        );
        case 'scanning': return (
            <div>
                <p className="mb-4">{t('syncCameraHelp')}</p>
                <div id="qr-reader" style={{ width: '100%' }}></div>
            </div>
        );
        case 'connecting': return <p className="text-blue-500">{t('syncConnecting')}</p>;
        case 'error': return (
            <div className="flex flex-col items-center gap-4">
                <p className="p-2 bg-red-100 text-red-700 rounded-md">{scanError || t('syncGenericError')}</p>
                <button onClick={handleRetry} className="bg-slate-200 text-slate-800 px-4 py-2 rounded-lg">Reintentar</button>
            </div>
        );
        default: return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md p-6 text-center">
        <header className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold flex items-center gap-2"><Wifi />{t('syncTitle')}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"><X className="text-slate-600 dark:text-slate-300" /></button>
        </header>
        <div className="flex flex-col items-center">
            {renderContent()}
        </div>
      </div>
    </div>
  );
}
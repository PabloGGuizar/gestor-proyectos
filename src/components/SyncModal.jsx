// =======================================================================
// ARCHIVO: src/components/SyncModal.jsx
// VERSIÓN FINAL COMPLETA
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
  const [status, setStatus] = useState('initializing'); // initializing, waiting, scanning, connected, syncing
  const [scanError, setScanError] = useState(null);
  const peerRef = useRef(null);
  const connRef = useRef(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    const peer = new Peer();
    peerRef.current = peer;

    peer.on('open', (id) => {
      setPeerId(id);
      setStatus('waiting');
    });

    peer.on('connection', (conn) => {
      connRef.current = conn;
      setStatus('connected');
      conn.on('data', (data) => {
        setStatus('syncing');
        onDataSynced(data);
      });
    });

    return () => {
      peer.destroy();
    };
  }, [onDataSynced]);

  useEffect(() => {
    if (status === 'scanning' && !scannerRef.current) {
      const scanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: 250 }, false);
      scannerRef.current = scanner;

      const onScanSuccess = (decodedText) => {
        const conn = peerRef.current.connect(decodedText);
        connRef.current = conn;
        conn.on('open', async () => {
          setStatus('connected');
          const allProjects = await db.projects.toArray();
          conn.send({ projects: allProjects });
          onClose();
        });
      };
      
      const onScanError = (error) => {
        console.error("Error del escáner QR:", error);
        setScanError("No se pudo iniciar la cámara. Revisa los permisos del navegador.");
      };
      
      scanner.render(onScanSuccess, onScanError);
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error("Fallo al limpiar el escáner.", error);
        });
        scannerRef.current = null;
      }
    };
  }, [status, onClose]);

  const handleStartScan = () => {
    setScanError(null);
    setStatus('scanning');
  };

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
                {scanError && <p className="p-2 bg-red-100 text-red-700 rounded-md mb-4">{scanError}</p>}
                <div id="qr-reader" style={{ width: '100%' }}></div>
            </div>
        );
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
// src/components/SolidAuth.jsx
import React, { useState } from 'react';
import {
  login,
  logout
} from '@inrupt/solid-client-authn-browser';
import { useLocalization } from '../context/LanguageContext';

export default function SolidAuth({ isLoggedIn, webId }) {
  const { t } = useLocalization();
  const [providerUrl, setProviderUrl] = useState('https://solidcommunity.net');

  const handleLogin = () => {
    if (!providerUrl.trim()) {
      alert('Por favor, introduce la URL de tu proveedor de Solid Pod.');
      return;
    }
    login({
      oidcIssuer: providerUrl,
      redirectUrl: window.location.href,
      clientName: 'Gestor de Proyectos'
    });
  };

  const handleLogout = () => {
    logout();
  };

  if (isLoggedIn) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm mr-2 hidden md:inline truncate max-w-xs" title={webId}>
          {t('loggedInAs', { webId })}
        </span>
        <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors">
          {t('logout')}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-2">
      <input
        type="url"
        placeholder="URL de tu Pod Provider"
        value={providerUrl}
        onChange={(e) => setProviderUrl(e.target.value)}
        className="px-3 py-2 border rounded-lg dark:bg-slate-700 w-full sm:w-auto"
      />
      <button onClick={handleLogin} className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors w-full sm:w-auto">
        {t('loginWithSolid')}
      </button>
    </div>
  );
}
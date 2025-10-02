import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { Network } from '@capacitor/network';

export const useMobile = () => {
  const [isNative, setIsNative] = useState(false);
  const [networkStatus, setNetworkStatus] = useState(true);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    setIsNative(Capacitor.isNativePlatform());

    // Настройка статус бара для мобильных устройств
    if (Capacitor.isNativePlatform()) {
      StatusBar.setStyle({ style: Style.Dark });
      StatusBar.setBackgroundColor({ color: '#ffffff' });
    }

    // Отслеживание состояния сети
    const handleNetworkChange = (status: any) => {
      setNetworkStatus(status.connected);
    };

    Network.addListener('networkStatusChange', handleNetworkChange);

    // Отслеживание клавиатуры
    if (Capacitor.getPlatform() !== 'web') {
      Keyboard.addListener('keyboardWillShow', (info) => {
        setKeyboardHeight(info.keyboardHeight);
      });

      Keyboard.addListener('keyboardWillHide', () => {
        setKeyboardHeight(0);
      });
    }

    return () => {
      Network.removeAllListeners();
      if (Capacitor.getPlatform() !== 'web') {
        Keyboard.removeAllListeners();
      }
    };
  }, []);

  return {
    isNative,
    networkStatus,
    keyboardHeight,
    platform: Capacitor.getPlatform()
  };
};
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import theme from '../lib/theme';

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  type: 'success' | 'info' | 'warning' | 'error';
  read: boolean;
}

interface NotificationIconProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
}

const { width } = Dimensions.get('window');

export default function NotificationIcon({ 
  notifications, 
  onMarkAsRead, 
  onClearAll 
}: NotificationIconProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const unreadCount = notifications.filter(n => !n.read).length;

  const toggleExpanded = () => {
    const toValue = isExpanded ? 0 : 1;
    setIsExpanded(!isExpanded);
    
    Animated.timing(animation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'close-circle';
      case 'warning':
        return 'warning';
      default:
        return 'information-circle';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return theme.COLORS.success;
      case 'error':
        return theme.COLORS.error;
      case 'warning':
        return '#FFA500';
      default:
        return theme.COLORS.primary;
    }
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  const dropdownHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.min(300, notifications.length * 80 + 60)],
  });

  const dropdownOpacity = animation.interpolate({
    inputRange: [0, 0.1, 1],
    outputRange: [0, 0, 1],
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.iconContainer} 
        onPress={toggleExpanded}
        activeOpacity={0.7}
      >
        <Ionicons 
          name="notifications-outline" 
          size={24} 
          color={theme.COLORS.text} 
        />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {isExpanded && (
        <Animated.View 
          style={[
            styles.dropdown,
            { 
              height: dropdownHeight,
              opacity: dropdownOpacity
            }
          ]}
        >
          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Notificaciones</Text>
              {notifications.length > 0 && (
                <TouchableOpacity onPress={onClearAll} style={styles.clearButton}>
                  <Text style={styles.clearText}>Limpiar</Text>
                </TouchableOpacity>
              )}
            </View>

            {notifications.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons 
                  name="notifications-off-outline" 
                  size={48} 
                  color={theme.COLORS.muted} 
                />
                <Text style={styles.emptyText}>No hay notificaciones</Text>
              </View>
            ) : (
              notifications.map((notification) => (
                <TouchableOpacity
                  key={notification.id}
                  style={[
                    styles.notificationItem,
                    !notification.read && styles.unreadNotification
                  ]}
                  onPress={() => onMarkAsRead(notification.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.notificationContent}>
                    <View style={styles.notificationHeader}>
                      <Ionicons
                        name={getNotificationIcon(notification.type)}
                        size={20}
                        color={getNotificationColor(notification.type)}
                      />
                      <Text style={styles.notificationTitle}>
                        {notification.title}
                      </Text>
                      <Text style={styles.notificationTime}>
                        {formatTime(notification.timestamp)}
                      </Text>
                    </View>
                    <Text style={styles.notificationMessage}>
                      {notification.message}
                    </Text>
                  </View>
                  {!notification.read && <View style={styles.unreadDot} />}
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  iconContainer: {
    position: 'relative',
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: theme.COLORS.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  dropdown: {
    position: 'absolute',
    top: 50,
    right: 0,
    width: width * 0.85,
    backgroundColor: theme.COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.COLORS.outline,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  scrollView: {
    maxHeight: 300,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.COLORS.outline,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.COLORS.text,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: theme.COLORS.surfaceVariant,
    borderRadius: 6,
  },
  clearText: {
    color: theme.COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    color: theme.COLORS.muted,
    marginTop: 12,
    fontSize: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.COLORS.outline,
    position: 'relative',
  },
  unreadNotification: {
    backgroundColor: theme.COLORS.surfaceVariant,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.COLORS.text,
    marginLeft: 8,
    flex: 1,
  },
  notificationTime: {
    fontSize: 12,
    color: theme.COLORS.muted,
  },
  notificationMessage: {
    fontSize: 14,
    color: theme.COLORS.muted,
    lineHeight: 20,
  },
  unreadDot: {
    position: 'absolute',
    right: 16,
    top: 20,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.COLORS.primary,
  },
});

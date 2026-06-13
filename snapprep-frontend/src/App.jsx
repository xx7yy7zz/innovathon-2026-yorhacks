import React, { useState, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator,
  Image,
  StatusBar
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function App() {
  const [messages, setMessages] = useState([
    { id: '1', role: 'ai', text: '¡Hola! Envíame una captura de pantalla de un problema de matemáticas o escribe una pregunta, ¡y te ayudaré a resolverlo!' }
  ]);
  const [inputText, setInputText] = useState('');
  const [attachedImage, setAttachedImage] = useState(null); 
  const [isTyping, setIsTyping] = useState(false);
  
  const flatListRef = useRef(null);

  const handleAttachImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("¡Se requieren permisos para acceder a la galería de fotos!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,        
      base64: true,        
    });

    if (!result.canceled) {
      setAttachedImage({
        uri: result.assets[0].uri,       
        base64: result.assets[0].base64  
      });
    }
  };

  const handleRemoveImage = () => {
    setAttachedImage(null);
  };

  const handleSend = async () => {
    if (!inputText.trim() && !attachedImage) return;

    const userText = inputText;
    const currentImage = attachedImage; 

    const newUserMsg = {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
      imageUri: currentImage ? currentImage.uri : null 
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputText('');
    setAttachedImage(null); 
    setIsTyping(true);

    try {
      const response = await fetch('http://127.0.0.1:3000/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: userText,
          image: currentImage ? currentImage.base64 : null, 
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const aiResponse = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: data.explanation,
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error("ERROR DE PETICIÓN EN EL FRONTEND:", error);
      setMessages(prev => [
        ...prev,
        { id: Date.now().toString(), role: 'ai', text: 'Lo siento, ocurrió un error al procesar el problema. ¡Por favor, inténtalo de nuevo!' }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isUser = item.role === 'user';
    
    return (
      <View style={[styles.messageRow, isUser ? styles.userRow : styles.aiRow]}>
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
          
          {item.imageUri && (
            <Image 
              source={{ uri: item.imageUri }} 
              style={styles.chatImage} 
              resizeMode="cover"
            />
          )}

          {item.text ? (
            <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>
              {item.text}
            </Text>
          ) : null}
          
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="dark-content" />
      
      {/* Encabezado Premium Minimalista */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SnapPrep <Text style={styles.headerAccent}>SAT</Text></Text>
        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Tutor de IA Activo</Text>
        </View>
      </View>

      {/* Lienzo Principal del Chat */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.chatContainer}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Estado de Escritura Elegante */}
      {isTyping && (
        <View style={styles.typingIndicator}>
          <ActivityIndicator size="small" color="#1a73e8" />
          <Text style={styles.typingText}>Analizando tu problema de matemáticas...</Text>
        </View>
      )}

      {/* Puerto de Entrada Flotante */}
      <View style={styles.inputArea}>
        
        {attachedImage && (
          <View style={styles.attachmentPreview}>
            <Image source={{ uri: attachedImage.uri }} style={styles.previewThumbnail} />
            <Text style={styles.attachmentText}>Captura preparada</Text>
            <TouchableOpacity onPress={handleRemoveImage} style={styles.removeButton}>
              <Text style={styles.removeIcon}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.inputBarContainer}>
          {/* Icono de Adjuntar Acción */}
          <TouchableOpacity style={styles.attachButton} onPress={handleAttachImage}>
            <Text style={styles.attachIcon}>📸</Text>
          </TouchableOpacity>

          {/* Entrada de texto fluida */}
          <TextInput
            style={styles.textInput}
            placeholder="Escribe una pregunta o sube un problema..."
            placeholderTextColor="#9aa0a6"
            value={inputText}
            onChangeText={setInputText}
            multiline
          />

          {/* Botón de Envío Redondeado y Limpio */}
          <TouchableOpacity 
            style={[styles.sendButton, (!inputText.trim() && !attachedImage) && styles.sendButtonDisabled]} 
            onPress={handleSend}
            disabled={!inputText.trim() && !attachedImage}
          >
            <Text style={styles.sendIcon}>🗲</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa' 
  },
  header: { 
    height: 100, 
    paddingTop: 55, 
    backgroundColor: '#ffffff', 
    alignItems: 'center', 
    justifyContent: 'center',
    borderBottomWidth: 1, 
    borderBottomColor: '#f1f3f4',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: '700',
    color: '#1f1f1f',
    letterSpacing: -0.5
  },
  headerAccent: {
    color: '#1a73e8'
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34a853',
    marginRight: 5
  },
  statusText: {
    fontSize: 11,
    color: '#5f6368',
    fontWeight: '500'
  },
  chatContainer: { 
    paddingHorizontal: 16,
    paddingVertical: 20 
  },
  messageRow: { 
    marginBottom: 16, 
    flexDirection: 'row' 
  },
  userRow: { 
    justifyContent: 'flex-end' 
  },
  aiRow: { 
    justifyContent: 'flex-start' 
  },
  messageBubble: { 
    maxWidth: '85%', 
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18 
  },
  userBubble: { 
    backgroundColor: '#1a73e8', 
    borderBottomRightRadius: 4,
    elevation: 1,
    shadowColor: '#1a73e8',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  aiBubble: { 
    backgroundColor: '#ffffff', 
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e8eaed',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 1,
  },
  messageText: { 
    fontSize: 15, 
    lineHeight: 22,
    letterSpacing: -0.1
  },
  userText: { 
    color: '#ffffff',
    fontWeight: '500'
  },
  aiText: { 
    color: '#3c4043' 
  },
  chatImage: { 
    width: 240, 
    height: 160, 
    borderRadius: 12, 
    marginBottom: 8 
  },
  typingIndicator: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 24,
    paddingVertical: 8
  },
  typingText: { 
    marginLeft: 10, 
    color: '#1a73e8', 
    fontSize: 14,
    fontStyle: 'italic' 
  },
  inputArea: { 
    padding: 16, 
    paddingBottom: Platform.OS === 'ios' ? 34 : 16, 
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f3f4'
  },
  attachmentPreview: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    backgroundColor: '#f1f3f4', 
    padding: 8, 
    borderRadius: 12, 
    marginBottom: 12 
  },
  previewThumbnail: { 
    width: 44, 
    height: 44, 
    borderRadius: 8 
  },
  attachmentText: { 
    color: '#3c4043', 
    fontWeight: '600', 
    flex: 1, 
    marginLeft: 12,
    fontSize: 14
  },
  removeButton: {
    backgroundColor: '#e8eaed',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4
  },
  removeIcon: { 
    fontSize: 12, 
    color: '#5f6368',
    fontWeight: '700'
  },
  inputBarContainer: { 
    flexDirection: 'row', 
    alignItems: 'center',
    backgroundColor: '#f1f3f4',
    borderRadius: 28,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  attachButton: { 
    padding: 10, 
    borderRadius: 20,
  },
  attachIcon: { 
    fontSize: 20 
  },
  textInput: { 
    flex: 1, 
    paddingHorizontal: 12, 
    paddingTop: 8, 
    paddingBottom: 8, 
    fontSize: 15, 
    color: '#1f1f1f',
    maxHeight: 120 
  },
  sendButton: { 
    backgroundColor: '#1a73e8', 
    borderRadius: 20, 
    width: 40, 
    height: 40, 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  sendButtonDisabled: { 
    backgroundColor: '#dae1e7',
  },
  sendIcon: { 
    fontSize: 16, 
    color: '#ffffff',
    fontWeight: '700'
  }
});
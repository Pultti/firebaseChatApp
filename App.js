import { convertFirebaseTimeStampToJS } from './helper/Functions'
import { StyleSheet, TextInput, Button, View, SafeAreaView, ScrollView, Text} from 'react-native'; // Remove 'Constants' from this import
import { firestore, collection, addDoc, MESSAGES, serverTimestamp, query, onSnapshot, orderBy } from './firebase/Config'; // Make sure to import 'query' and 'onSnapshot'
import { useState, useEffect } from 'react';
import Constants from 'expo-constants';

import Login from './functions/login';

export default function App() {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [user, setUser] = useState(null);
  
// Funktio uuden viestin tallentamiseen Firebase-tietokantaan.
  const save = async() => {
    const docRef = await addDoc(collection(firestore, MESSAGES), {
      text: newMessage,
      created: serverTimestamp()
    }).catch (error => console.log(error))
    setNewMessage('')
    console.log('Message saved.')
  }

    // Hook, joka suoritetaan kun komponentti ladataan ensimmäisen kerran.
    // Käytetään Firebase-tietokannasta viestien kuunteluun reaaliajassa.
  useEffect(() => {
    const q = query(collection(firestore,MESSAGES), orderBy('created', 'desc'))

    const unsubscribe = onSnapshot(q,(querySnapshot) => {
      const tempMessages = []
      querySnapshot.forEach((doc) => {
        const messageObject = {
          id: doc.id,
          text: doc.data().text,
          created: convertFirebaseTimeStampToJS(doc.data().created)
        }
        tempMessages.push(messageObject)
      })
      setMessages(tempMessages)
    })
    return() => {
      unsubscribe()
    }
  }, [])

  if (!user) {
    return <Login onLoginSuccess={setUser} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {messages.map((message) => (
          <View style={styles.message} key={message.id}>
            <Text style={styles.messageInfo}>{message.created}</Text>
            <Text>{message.text}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.footer}>
        <TextInput
          placeholder='Send message...'
          value={newMessage}
          onChangeText={text => setNewMessage(text)}
          style={styles.input}
        />
        <Button title="Send" onPress={save} />
      </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    paddingTop: Constants.statusBarHeight,
    flex: 1,
    backgroundColor: '#fff',
  },
  message: {
    padding: 10,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: '#f5f5f5',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginLeft: 10,
    marginRight: 10
  },
  messageInfo: {
    fontSize: 12
  },
  scrollView: {
    flex: 1, // Add flex: 1 to make sure ScrollView takes up all available space above the footer
  },
  footer: {
    flexDirection: 'row', // Align children (TextInput and Button) in a row
    padding: 10,
  },
  input: {
    flex: 1, // Take up as much space as possible
    marginRight: 10, // Add some margin between the TextInput and the Button
    borderWidth: 1, // Match the message border
    borderColor: '#ccc', // Match the message border color
    borderRadius: 5, // Match the message border radius
    padding: 10, // Match the message padding
  },
});
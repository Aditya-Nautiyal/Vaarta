import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import CustomButton from '../../component/CustomButton';
import SpaceFiller from '../../component/SpaceFiller';
import auth from '@react-native-firebase/auth';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLoginPress = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    try {
      // Try logging in
      await auth().signInWithEmailAndPassword(email, password);
      console.log('Login successful');
      navigation.navigate('Home');
    } catch (error) {
      if (error?.code === 'auth/user-not-found') {
        // If user doesn't exist, sign them up
        try {
          await auth().createUserWithEmailAndPassword(email, password);
          console.log('Account created & logged in');
          navigation.navigate('Home');
        } catch (signupError) {
          Alert.alert('Signup Error', signupError?.message);
        }
      } else {
        Alert.alert('Login Error', error?.message);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.topSection} />
          <View style={styles.loginSignUpContainer}>
            <Text style={styles.title}>Login</Text>
            <SpaceFiller margin={24} />
            <View style={styles.inputTextContainer}>
              <Text style={styles.inputTextTitle}>Email</Text>
              <SpaceFiller margin={4} />
              <TextInput
                style={styles.inputText}
                onChangeText={setEmail}
                placeholder="Ex: abc@gmail.com"
                autoCapitalize="none"
              />
            </View>
            <SpaceFiller />
            <View style={styles.inputTextContainer}>
              <Text style={styles.inputTextTitle}>Password</Text>
              <SpaceFiller margin={4} />
              <TextInput
                secureTextEntry
                style={styles.inputText}
                onChangeText={setPassword}
                placeholder="Ex: Login@12345"
              />
            </View>
            <SpaceFiller margin={24} />
            <CustomButton title="Login" onPress={handleLoginPress} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;

// styles stay the same...

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  topSection: {
    flex: 0.4, // black top part stays same height
  },
  loginSignUpContainer: {
    flex: 0.6, // white card takes rest of screen
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  title: {
    color: 'black',
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  inputTextContainer: {
    padding: 12,
    backgroundColor: 'white',
    width: '100%',
    borderRadius: 10,
  },
  inputTextTitle: {
    color: 'black',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  inputText: {
    fontFamily: 'monospace',
    fontSize: 12,
    padding: 8,
    color: 'grey',
  },
});

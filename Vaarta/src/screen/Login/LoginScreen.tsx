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
  TouchableOpacity,
} from 'react-native';
import CustomButton from '../../component/CustomButton';
import SpaceFiller from '../../component/SpaceFiller';
import auth from '@react-native-firebase/auth';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true); // true = login mode, false = sign-up mode

  const handleAuthPress = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    try {
      if (isLogin) {
        // Login
        await auth().signInWithEmailAndPassword(email, password);
        console.log('Login successful');
      } else {
        // Sign up
        await auth().createUserWithEmailAndPassword(email, password);
        console.log('Account created & logged in');
      }
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert(isLogin ? 'Login Error' : 'Signup Error', error?.message);
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
            <Text style={styles.title}>{isLogin ? 'Login' : 'Sign Up'}</Text>
            <SpaceFiller margin={24} />
            <View style={styles.inputTextContainer}>
              <Text style={styles.inputTextTitle}>Email</Text>
              <SpaceFiller margin={4} />
              <TextInput
                style={styles.inputText}
                onChangeText={setEmail}
                placeholder="Ex: abc@gmail.com"
                autoCapitalize="none"
                value={email}
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
                value={password}
              />
            </View>
            <SpaceFiller margin={24} />
            <CustomButton
              title={isLogin ? 'Login' : 'Sign Up'}
              onPress={handleAuthPress}
            />
            <SpaceFiller margin={16} />
            <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
              <Text style={{ color: 'blue', fontFamily: 'monospace' }}>
                {isLogin
                  ? "Don't have an account? Sign Up"
                  : 'Already have an account? Login'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  topSection: {
    flex: 0.4,
  },
  loginSignUpContainer: {
    flex: 0.6,
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

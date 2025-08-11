import React, { useState, useEffect } from 'react';
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
import {
  GoogleAuthProvider,
  getAuth,
  signInWithCredential,
} from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true); // true = login mode, false = sign-up mode

  useEffect(() => {
    // Configure Google Sign-In
    GoogleSignin.configure({
      webClientId:
        '424764311193-1ce2o1sb0lh169de927nbki5maec0upr.apps.googleusercontent.com', // From Firebase Console or Google Cloud Console
      offlineAccess: true,
    });
  }, []);

  async function onGoogleButtonPress() {
    try {
      // Check if Google Play Services are available and updated on the device
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      // Trigger Google Sign-In prompt and wait for user to sign in
      const signInResult = await GoogleSignin.signIn();

      // Attempt to extract the ID token from the sign-in result
      // This handles different response formats depending on the library version
      let idToken = signInResult.data?.idToken || signInResult.idToken;

      // If no ID token is found, alert the user and stop execution
      if (!idToken) {
        Alert.alert('Google Sign-In Error', 'No ID token found');
        return;
      }

      // Log the sign-in result and ID token for debugging
      console.log('Google Sign-In Result:', signInResult);
      console.log('ID Token:', idToken);

      // Create a Firebase credential using the Google ID token
      const googleCredential = GoogleAuthProvider.credential(idToken);

      // Sign in to Firebase Authentication with the Google credential
      await signInWithCredential(getAuth(), googleCredential);

      // Navigate to the 'Home' screen after successful sign-in
      navigation.navigate('Home');
    } catch (error) {
      // If any error occurs during the process, log it and show an alert
      console.error('Google Sign-In Error:', error);
      Alert.alert(
        'Google Sign-In Error',
        error.message || 'An error occurred during sign in',
      );
    }
  }

  const handleAuthPress = async () => {
    // Check if email or password fields are empty
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return; // Stop execution if either is missing
    }

    try {
      if (isLogin) {
        // If isLogin is true → attempt to log in the user
        await auth().signInWithEmailAndPassword(email, password);
        console.log('Login successful');
      } else {
        // If isLogin is false → create a new account and log in the user
        await auth().createUserWithEmailAndPassword(email, password);
        console.log('Account created & logged in');
      }

      // After successful login or signup, navigate to the Home screen
      navigation.navigate('Home');
    } catch (error) {
      // If there is an error during login or signup, show an alert
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
            <SpaceFiller margin={24} />
            <CustomButton
              title={'Login with Google'}
              onPress={onGoogleButtonPress}
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

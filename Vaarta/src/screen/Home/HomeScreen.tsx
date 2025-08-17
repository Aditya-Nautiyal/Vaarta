import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  PermissionsAndroid,
  Button,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import MLKitOcr from 'react-native-mlkit-ocr';

const HomeScreen = () => {
  const [selectedDoc, setSelectedDoc] = useState('aadhaar'); // aadhaar | passport
  const [isAadhaarFrontScanned, setIsAadhaarFrontScanned] = useState(false);
  const [isAadhaarBackScanned, setIsAadhaarBackScanned] = useState(false);
  const [isPassportFrontScanned, setIsPassportFrontScanned] = useState(false);
  const [isPassportBackScanned, setIsPassportBackScanned] = useState(false);

  const [scannedData, setScannedData] = useState({});

  async function requestCameraPermission() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'App needs access to your camera to scan documents',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  }

  useEffect(() => {
    requestCameraPermission();
  }, []);

  // Reset data when switching between Aadhaar & Passport
  useEffect(() => {
    setScannedData({
      name: 'NA',
      dob: 'NA',
      gender: 'NA',
      aadhaarNumber: 'NA',
      address: 'NA',
      city: 'NA',
      state: 'NA',
      postcode: 'NA',
      passportNumber: 'NA',
      fatherName: 'NA',
      motherName: 'NA',
      placeOfIssue: 'NA',
      dateOfIssue: 'NA',
      expiryDate: 'NA',
    });
    setIsAadhaarFrontScanned(false);
    setIsAadhaarBackScanned(false);
    setIsPassportFrontScanned(false);
    setIsPassportBackScanned(false);
  }, [selectedDoc]);

  const parseDocumentText = (text: any, side: any) => {
    const data = {};

    if (selectedDoc === 'aadhaar') {
      if (side === 'front') {
        const aadhaarMatch = text.match(/\b\d{4}\s\d{4}\s\d{4}\b/);
        if (aadhaarMatch) data.aadhaarNumber = aadhaarMatch[0];

        const dobMatch = text.match(/\b\d{2}\/\d{2}\/\d{4}\b/);
        if (dobMatch) data.dob = dobMatch[0];

        if (/male/i.test(text)) data.gender = 'Male';
        else if (/female/i.test(text)) data.gender = 'Female';

        const lines = text
          .split('\n')
          .map(l => l.trim())
          .filter(Boolean);
        if (lines.length > 0) data.name = lines[0];
      } else if (side === 'back') {
        const postcodeMatch = text.match(/\b\d{6}\b/);
        if (postcodeMatch) data.postcode = postcodeMatch[0];

        const lines = text
          .split('\n')
          .map(l => l.trim())
          .filter(Boolean);
        if (lines.length > 1) {
          data.address = lines.slice(0, -2).join(', ');
          data.city = lines[lines.length - 2];
          data.state = lines[lines.length - 1];
        }
      }
    } else if (selectedDoc === 'passport') {
      if (side === 'front') {
        const passportMatch = text.match(/\b[A-Z][0-9]{7}\b/);
        if (passportMatch) data.passportNumber = passportMatch[0];

        const dobMatch = text.match(/\b\d{2}\/\d{2}\/\d{4}\b/);
        if (dobMatch) data.dob = dobMatch[0];

        if (/male/i.test(text)) data.gender = 'Male';
        else if (/female/i.test(text)) data.gender = 'Female';

        const issueMatch = text.match(
          /Date of Issue\s*[:\-]?\s*(\d{2}\/\d{2}\/\d{4})/i,
        );
        if (issueMatch) data.dateOfIssue = issueMatch[1];

        const expiryMatch = text.match(
          /Date of Expiry\s*[:\-]?\s*(\d{2}\/\d{2}\/\d{4})/i,
        );
        if (expiryMatch) data.expiryDate = expiryMatch[1];

        const placeMatch = text.match(/Place of Issue\s*[:\-]?\s*(.*)/i);
        if (placeMatch) data.placeOfIssue = placeMatch[1];

        const lines = text
          .split('\n')
          .map(l => l.trim())
          .filter(Boolean);
        if (lines.length > 1) data.name = lines[1];
      } else if (side === 'back') {
        const fatherMatch = text.match(/Father.*[:\-]?\s*(.*)/i);
        if (fatherMatch) data.fatherName = fatherMatch[1];

        const motherMatch = text.match(/Mother.*[:\-]?\s*(.*)/i);
        if (motherMatch) data.motherName = motherMatch[1];

        const lines = text
          .split('\n')
          .map(l => l.trim())
          .filter(Boolean);
        if (lines.length > 1) data.address = lines.slice(-3).join(', ');
      }
    }

    return data;
  };

  const handleScan = async side => {
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        cameraType: 'back',
      });
      if (result.assets && result.assets.length > 0) {
        const filePath = result.assets[0].uri;
        const processed = await MLKitOcr.detectFromUri(filePath);
        const rawText = processed.map(block => block.text).join('\n');

        const newData = parseDocumentText(rawText, side);

        setScannedData(prev => ({
          ...prev,
          ...Object.fromEntries(
            Object.entries(newData).filter(([_, v]) => v !== 'NA'),
          ),
        }));

        if (side === 'front' && selectedDoc === 'aadhaar')
          setIsAadhaarFrontScanned(true);
        if (side === 'back' && selectedDoc === 'aadhaar')
          setIsAadhaarBackScanned(true);
        if (side === 'front' && selectedDoc === 'passport')
          setIsPassportFrontScanned(true);
        if (side === 'back' && selectedDoc === 'passport')
          setIsPassportBackScanned(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Document Scanner</Text>

      {/* Radio Buttons */}
      <View style={styles.radioGroup}>
        <TouchableOpacity
          style={styles.radioOption}
          onPress={() => setSelectedDoc('aadhaar')}
        >
          <View
            style={[
              styles.radioCircle,
              selectedDoc === 'aadhaar' && styles.radioSelected,
            ]}
          />
          <Text style={styles.radioLabel}>Aadhaar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.radioOption}
          onPress={() => setSelectedDoc('passport')}
        >
          <View
            style={[
              styles.radioCircle,
              selectedDoc === 'passport' && styles.radioSelected,
            ]}
          />
          <Text style={styles.radioLabel}>Passport</Text>
        </TouchableOpacity>
      </View>

      {/* Scan Buttons */}
      {selectedDoc === 'aadhaar' ? (
        <View style={styles.scanButtons}>
          <Button
            title="Scan Aadhaar Front"
            onPress={() => handleScan('front')}
          />
          {isAadhaarFrontScanned && (
            <Text style={styles.success}>✅ Aadhaar Front Scanned</Text>
          )}
          <Button
            title="Scan Aadhaar Back"
            onPress={() => handleScan('back')}
          />
          {isAadhaarBackScanned && (
            <Text style={styles.success}>✅ Aadhaar Back Scanned</Text>
          )}
        </View>
      ) : (
        <View style={styles.scanButtons}>
          <Button
            title="Scan Passport Front"
            onPress={() => handleScan('front')}
          />
          {isPassportFrontScanned && (
            <Text style={styles.success}>✅ Passport Front Scanned</Text>
          )}
          <Button
            title="Scan Passport Back"
            onPress={() => handleScan('back')}
          />
          {isPassportBackScanned && (
            <Text style={styles.success}>✅ Passport Back Scanned</Text>
          )}
        </View>
      )}

      {/* Results Table */}
      <View style={styles.table}>
        {Object.entries(scannedData).map(([key, value]) => (
          <View key={key} style={styles.row}>
            <Text style={styles.cellKey}>{key.replace(/([A-Z])/g, ' $1')}</Text>
            <Text style={styles.cellValue}>{value}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    marginVertical: 15,
    color: '#333',
  },
  radioGroup: { flexDirection: 'row', marginBottom: 20 },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 15,
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#666',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  radioSelected: { backgroundColor: '#007bff', borderColor: '#007bff' },
  radioLabel: { fontSize: 16, color: '#333' },
  scanButtons: { marginBottom: 20, alignItems: 'center' },
  success: { marginVertical: 5, fontSize: 14, color: 'green' },
  table: {
    width: '100%',
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  cellKey: {
    fontWeight: '600',
    fontSize: 15,
    color: '#444',
    textTransform: 'capitalize',
  },
  cellValue: { fontSize: 15, color: '#222' },
});

export default HomeScreen;

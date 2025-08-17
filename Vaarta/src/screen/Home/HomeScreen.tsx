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

  const [scannedData, setScannedData] = useState({
    name: 'NA',
    dob: 'NA',
    gender: 'NA',
    aadhaarNumber: 'NA',
    address: 'NA',
    city: 'NA',
    state: 'NA',
    postcode: 'NA',
    passportNumber: 'NA',
  });

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

  const parseDocumentText = (text: any, side: any) => {
    const data = {
      name: 'NA',
      dob: 'NA',
      gender: 'NA',
      aadhaarNumber: 'NA',
      address: 'NA',
      city: 'NA',
      state: 'NA',
      postcode: 'NA',
      passportNumber: 'NA',
    };

    if (selectedDoc === 'aadhaar') {
      if (side === 'front') {
        // Aadhaar regex (xxxx xxxx xxxx)
        const aadhaarMatch = text.match(/\b\d{4}\s\d{4}\s\d{4}\b/);
        if (aadhaarMatch) data.aadhaarNumber = aadhaarMatch[0];

        // DOB
        const dobMatch = text.match(/\b\d{2}\/\d{2}\/\d{4}\b/);
        if (dobMatch) data.dob = dobMatch[0];

        // Gender
        if (/male/i.test(text)) data.gender = 'Male';
        else if (/female/i.test(text)) data.gender = 'Female';

        // Name → take first line as fallback
        const lines = text
          .split('\n')
          .map(l => l.trim())
          .filter(Boolean);
        if (lines.length > 0) {
          data.name = lines[0];
        }
      } else if (side === 'back') {
        // Address extraction (simplified)
        const addressMatch = text.match(/Address\s*[:\-]?\s*(.*)/i);
        if (addressMatch) data.address = addressMatch[1];

        const postcodeMatch = text.match(/\b\d{6}\b/);
        if (postcodeMatch) data.postcode = postcodeMatch[0];

        // State / City (naive extraction)
        const lines = text
          .split('\n')
          .map(l => l.trim())
          .filter(Boolean);
        if (lines.length > 1) {
          data.city = lines[lines.length - 2];
          data.state = lines[lines.length - 1];
        }
      }
    } else if (selectedDoc === 'passport') {
      // Passport regex → 1 letter + 7 digits
      const passportMatch = text.match(/\b[A-Z][0-9]{7}\b/);
      if (passportMatch) data.passportNumber = passportMatch[0];

      const dobMatch = text.match(/\b\d{2}\/\d{2}\/\d{4}\b/);
      if (dobMatch) data.dob = dobMatch[0];

      if (/male/i.test(text)) data.gender = 'Male';
      else if (/female/i.test(text)) data.gender = 'Female';

      const lines = text
        .split('\n')
        .map(l => l.trim())
        .filter(Boolean);
      if (lines.length > 1) {
        data.name = lines[1];
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

        // ✅ merge instead of overwriting
        setScannedData(prev => ({
          ...prev,
          ...Object.fromEntries(
            Object.entries(newData).filter(([_, v]) => v !== 'NA'),
          ),
        }));

        if (side === 'front') setIsAadhaarFrontScanned(true);
        if (side === 'back') setIsAadhaarBackScanned(true);
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
            title="Scan Passport"
            onPress={() => handleScan('passport')}
          />
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
  radioGroup: {
    flexDirection: 'row',
    marginBottom: 20,
  },
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
  radioSelected: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  radioLabel: {
    fontSize: 16,
    color: '#333',
  },
  scanButtons: {
    marginBottom: 20,
    alignItems: 'center',
  },
  success: {
    marginVertical: 5,
    fontSize: 14,
    color: 'green',
  },
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
  cellValue: {
    fontSize: 15,
    color: '#222',
  },
});

export default HomeScreen;

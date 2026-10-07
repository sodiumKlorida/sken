import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { BarcodeScanningResult, CameraView, useCameraPermissions } from 'expo-camera';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import {
  Alert,
  Button,
  Dimensions,
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');
const viewfinderSize = width * 0.6;

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState<boolean>(false);
  const [scannedList, setScannedList] = useState<string[]>([]);
  const [isTorchOn, setIsTorchOn] = useState<boolean>(false); // State untuk senter

  // State untuk form edit / input manual
  const [isEditModalVisible, setEditModalVisible] = useState<boolean>(false);
  const [selectedItemToEdit, setSelectedItemToEdit] = useState<string | null>(null);
  const [isManualInput, setIsManualInput] = useState<boolean>(false);

  const [idKacaManual, setIdKacaManual] = useState('');
  const [typeKaca, setTypeKaca] = useState('');
  const [tebalKaca, setTebalKaca] = useState('');
  const [lebarKaca, setLebarKaca] = useState('');
  const [tinggiKaca, setTinggiKaca] = useState('');
  const [jenisKemasan, setJenisKemasan] = useState('BB');
  const [atIsi, setAtIsi] = useState('');
  const [isiPerPackaging, setIsiPerPackaging] = useState('');

  const currentDateUI = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={{ textAlign: 'center', marginBottom: 10 }}>
          Kami membutuhkan izin akses kamera untuk scan QR
        </Text>
        <Button onPress={requestPermission} title="Berikan Izin" />
      </View>
    );
  }

  const syncToGoogleSheet = async () => {
    if (scannedList.length === 0) {
      if (Platform.OS === 'web') {
        window.alert("Tidak ada data untuk disinkronkan.");
      } else {
        Alert.alert("Data Kosong", "Tidak ada data untuk disinkronkan.");
      }
      return;
    }

    try {
      const currentDate = new Date().toLocaleDateString('id-ID');

      const payload = scannedList.map(item => {
        let rowData = {
          tanggal: currentDate,
          id_kaca: '', 
          type_kaca: item, 
          tebal_kaca: '',
          ukuran_kaca: '',
          jenis_kemasan: '',
          at_isi: '',
          isi_per_packaging: ''
        };

        if (item.includes("ID:") && item.includes("Type:")) {
          const parts = item.split(' | ');

          rowData.id_kaca = parts[0]?.replace('ID: ', '') || '';
          rowData.type_kaca = parts[1]?.replace('Type: ', '') || '';
          rowData.tebal_kaca = parts[2]?.replace('Tebal: ', '') || '';
          rowData.ukuran_kaca = parts[3]?.replace('Ukuran: ', '') || '';
          rowData.jenis_kemasan = parts[4]?.replace('Kemasan: ', '') || '';
          rowData.at_isi = parts[5]?.replace('@isi: ', '') || '';
          rowData.isi_per_packaging = parts[6]?.replace('Pack: ', '') || '';
        } else {
          rowData.id_kaca = item;
          rowData.type_kaca = '-';
        }

        return rowData;
      });

      const scriptUrl = 'https://sheetdb.io/api/v1/u4ktxxamuzgr1';

      const response = await fetch(scriptUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: payload }),
      });

      if (response.ok) {
        if (Platform.OS === 'web') {
          window.alert("Data berhasil disinkronkan ke Google Sheet!");
        } else {
          Alert.alert("Berhasil", "Data berhasil disinkronkan ke Google Sheet!");
        }
      } else {
        const errorData = await response.json();
        if (Platform.OS === 'web') {
          window.alert("Gagal mengirim data ke server.");
        } else {
          Alert.alert("Gagal", "Gagal mengirim data ke server.");
        }
        console.log("Respon Gagal:", errorData);
      }
    } catch (error) {
      if (Platform.OS === 'web') {
        window.alert("Error Jaringan: " + String(error));
      } else {
        Alert.alert("Error Jaringan", String(error));
      }
      console.error(error);
    }
  };

  const exportToExcel = async () => {
    if (scannedList.length === 0) {
      if (Platform.OS === 'web') {
        window.alert("Belum ada data QR untuk diekspor.");
      } else {
        Alert.alert("Data Kosong", "Belum ada data QR untuk diekspor.");
      }
      return;
    }

    try {
      let csvString = "No,Hasil Scan/Input QR (ID)\n";
      scannedList.forEach((item, index) => {
        csvString += `${index + 1},"${item}"\n`;
      });

      const dateForFile = new Date().toLocaleDateString('id-ID').replace(/\//g, '-');
      const fileName = `Hasil_Scan_QR_${dateForFile}.csv`;

      const file = new File(Paths.document, fileName);
      file.write(csvString);

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(file.uri, {
          mimeType: 'text/csv',
          dialogTitle: 'Simpan/Bagikan Data Scan',
        });
      } else {
        if (Platform.OS === 'web') {
          window.alert("Fitur berbagi tidak tersedia di perangkat ini.");
        } else {
          Alert.alert("Gagal", "Fitur berbagi tidak tersedia di perangkat ini.");
        }
      }
    } catch (error) {
      if (Platform.OS === 'web') {
        window.alert("Gagal mengekspor data.");
      } else {
        Alert.alert("Error", "Gagal mengekspor data.");
      }
      console.error(error);
    }
  };

  const handleBarCodeScanned = ({ data }: BarcodeScanningResult) => {
    if (scanned) return;
    setScanned(true);

    console.log("Hasil Scan QR:", data);

    const isAlreadyScanned = scannedList.some(item => item.includes(data));

    if (isAlreadyScanned) {
      const confirmMessage = `Data "${data}" sudah ada dalam daftar. Yakin untuk menambahkan lagi?`;
      
      if (Platform.OS === 'web') {
        const userConfirmed = window.confirm(confirmMessage);
        if (userConfirmed) {
          setScannedList((prevList) => [...prevList, data]);
        }
        setTimeout(() => setScanned(false), 1000);
      } else {
        Alert.alert(
          "QR Sudah Ada",
          confirmMessage,
          [
            {
              text: "Tidak",
              style: "cancel",
              onPress: () => {
                setTimeout(() => setScanned(false), 1000);
              },
            },
            {
              text: "Ya",
              onPress: () => {
                setScannedList((prevList) => [...prevList, data]);
                setTimeout(() => setScanned(false), 1000);
              },
            },
          ]
        );
      }
    } else {
      setScannedList((prevList) => [...prevList, data]);
      setTimeout(() => setScanned(false), 1000);
    }
  };

  const removeItem = (itemToRemove: string) => {
    const confirmDelete = `Yakin ingin menghapus data "${itemToRemove}" dari daftar?`;

    if (Platform.OS === 'web') {
      if (window.confirm(confirmDelete)) {
        setScannedList((prevList) => prevList.filter((item) => item !== itemToRemove));
      }
    } else {
      Alert.alert(
        "Hapus Item",
        confirmDelete,
        [
          { text: "Batal", style: "cancel" },
          {
            text: "Hapus",
            style: "destructive",
            onPress: () => {
              setScannedList((prevList) =>
                prevList.filter((item) => item !== itemToRemove)
              );
            },
          },
        ]
      );
    }
  };

  const openManualInputForm = () => {
    setIsManualInput(true);
    setSelectedItemToEdit(null);
    setIdKacaManual('');
    setTypeKaca('');
    setTebalKaca('');
    setLebarKaca('');
    setTinggiKaca('');
    setJenisKemasan('BB');
    setAtIsi('');
    setIsiPerPackaging('');
    setEditModalVisible(true);
  };

  const openEditForm = (item: string) => {
    setIsManualInput(false);
    setSelectedItemToEdit(item);
    setEditModalVisible(true);
  };

  const simpanData = () => {
    if (isManualInput) {
      if (!idKacaManual.trim()) {
        if (Platform.OS === 'web') {
          window.alert("ID Kaca tidak boleh kosong!");
        } else {
          Alert.alert("Peringatan", "ID Kaca tidak boleh kosong!");
        }
        return;
      }

      const hasilManual = `ID: ${idKacaManual} | Type: ${typeKaca} | Tebal: ${tebalKaca} | Ukuran: ${lebarKaca}x${tinggiKaca} | Kemasan: ${jenisKemasan} | @isi: ${atIsi} | Pack: ${isiPerPackaging}`;
      
      setScannedList((prevList) => [...prevList, hasilManual]);
    } else {
      let idKaca = selectedItemToEdit;
      if (selectedItemToEdit && selectedItemToEdit.includes("ID:")) {
        const parts = selectedItemToEdit.split(' | ');
        idKaca = parts[0]?.replace('ID: ', '') || selectedItemToEdit;
      }

      const hasilEdit = `ID: ${idKaca} | Type: ${typeKaca} | Tebal: ${tebalKaca} | Ukuran: ${lebarKaca}x${tinggiKaca} | Kemasan: ${jenisKemasan} | @isi: ${atIsi} | Pack: ${isiPerPackaging}`;

      setScannedList((prevList) =>
        prevList.map((item) => (item === selectedItemToEdit ? hasilEdit : item))
      );
    }

    setEditModalVisible(false);

    setIdKacaManual('');
    setTypeKaca('');
    setTebalKaca('');
    setLebarKaca('');
    setTinggiKaca('');
    setJenisKemasan('BB');
    setAtIsi('');
    setIsiPerPackaging('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.cameraContainer}>
        <CameraView
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          zoom={0} // Zoom diatur ke 0 (normal) agar gambar tidak blur parah
          enableTorch={isTorchOn} // Mendukung lampu senter jika dibutuhkan
          style={StyleSheet.absoluteFill}
        >
          {/* Tombol Toggle Senter di dalam area kamera */}
          <TouchableOpacity 
            style={styles.torchButton} 
            onPress={() => setIsTorchOn(!isTorchOn)}
          >
            <MaterialCommunityIcons 
              name={isTorchOn ? "flash" : "flash-off"} 
              size={24} 
              color={isTorchOn ? "#FFD700" : "white"} 
            />
          </TouchableOpacity>

          <View style={styles.overlayContainer}>
            <View style={styles.viewfinder}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
            <Text style={styles.instructionText}>
              Arahkan QR Code ke dalam kotak
            </Text>
          </View>
        </CameraView>
      </View>

      <View style={[styles.listContainer, { paddingBottom: 45 }]}>
        <Text style={styles.title}>Daftar Hasil Scan / Input QR:</Text>
        <Text style={styles.dateText}>{currentDateUI}</Text>

        {scannedList.length === 0 ? (
          <Text style={styles.emptyText}>Belum ada data yang di-scan atau diinput.</Text>
        ) : (
          <FlatList
            data={scannedList}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={{ paddingBottom: 60 }}
            renderItem={({ item, index }) => (
              <View style={styles.itemRow}>
                <Text style={styles.itemText} numberOfLines={1}>
                  {index + 1}. {item}
                </Text>

                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    onPress={() => openEditForm(item)}
                    style={styles.editButton}
                  >
                    <MaterialCommunityIcons name="pencil-outline" size={24} color="#007bff" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => removeItem(item)}
                    style={styles.deleteButton}
                  >
                    <MaterialCommunityIcons name="trash-can-outline" size={24} color="#dc3545" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}
      </View>

      {/* Kumpulan Floating Action Buttons (FAB) */}
      <View style={styles.fabContainer}>
        <TouchableOpacity style={[styles.fab, { backgroundColor: '#ffc107', marginRight: 15 }]} onPress={openManualInputForm}>
          <MaterialCommunityIcons name="plus" size={28} color="#333" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.fab, { backgroundColor: '#4285F4', marginRight: 15 }]} onPress={syncToGoogleSheet}>
          <MaterialCommunityIcons name="cloud-upload" size={28} color="white" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.fab} onPress={exportToExcel}>
          <MaterialCommunityIcons name="file-excel" size={28} color="white" />
        </TouchableOpacity>
      </View>

      {/* Modal Form Input / Edit */}
      <Modal visible={isEditModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>
              {isManualInput ? "Input Manual Data Kaca" : "Edit Data Kaca"}
            </Text>

            {isManualInput && (
              <>
                <Text style={styles.label}>ID Kaca</Text>
                <TextInput style={styles.input} value={idKacaManual} onChangeText={setIdKacaManual} placeholder="Contoh: 21100BEGAS00087" />
              </>
            )}

            <Text style={styles.label}>Type Kaca</Text>
            <TextInput style={styles.input} value={typeKaca} onChangeText={setTypeKaca} />

            <Text style={styles.label}>Tebal Kaca</Text>
            <TextInput style={styles.input} value={tebalKaca} onChangeText={setTebalKaca} keyboardType="numeric" />

            <View style={styles.sizeContainer}>
              <View style={styles.sizeBox}>
                <Text style={styles.label}>Ukuran Kaca (P)</Text>
                <TextInput style={styles.input} value={lebarKaca} onChangeText={setLebarKaca} keyboardType="numeric" />
              </View>
              <Text style={styles.xText}>X</Text>
              <View style={styles.sizeBox}>
                <Text style={styles.label}>Ukuran Kaca (L)</Text>
                <TextInput style={styles.input} value={tinggiKaca} onChangeText={setTinggiKaca} keyboardType="numeric" />
              </View>
            </View>

            <Text style={styles.label}>Jenis Kemasan</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={jenisKemasan}
                onValueChange={(itemValue) => setJenisKemasan(itemValue)}
              >
                <Picker.Item label="BB" value="BB" />
                <Picker.Item label="Peti" value="Peti" />
                <Picker.Item label="LEMBAR" value="LEMBAR" />
              </Picker>
            </View>

            <Text style={styles.label}>@isi</Text>
            <TextInput style={styles.input} value={atIsi} onChangeText={setAtIsi} keyboardType="numeric" />

            <Text style={styles.label}>Isi per packaging</Text>
            <TextInput style={styles.input} value={isiPerPackaging} onChangeText={setIsiPerPackaging} keyboardType="numeric" />

            <View style={styles.modalButtons}>
              <Button title="Batal" color="#dc3545" onPress={() => setEditModalVisible(false)} />
              <Button title="Simpan" color="#28a745" onPress={simpanData} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  cameraContainer: { flex: 1.2, position: 'relative' },
  torchButton: { position: 'absolute', top: 20, right: 20, zIndex: 20, backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 30 },
  overlayContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  viewfinder: { width: viewfinderSize, height: viewfinderSize, borderWidth: 2, borderColor: 'transparent', backgroundColor: 'transparent', position: 'relative' },
  corner: { position: 'absolute', width: 25, height: 25, borderColor: '#00FF66', borderWidth: 4 },
  topLeft: { top: 0, left: 0, borderBottomWidth: 0, borderRightWidth: 0 },
  topRight: { top: 0, right: 0, borderBottomWidth: 0, borderLeftWidth: 0 },
  bottomLeft: { bottom: 0, left: 0, borderTopWidth: 0, borderRightWidth: 0 },
  bottomRight: { bottom: 0, right: 0, borderTopWidth: 0, borderLeftWidth: 0 },
  instructionText: { color: 'white', marginTop: 20, fontSize: 14, fontWeight: '600', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 5 },
  listContainer: { flex: 1, padding: 20, backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, elevation: 5 },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 5, color: '#333' },
  dateText: { fontSize: 14, color: '#666', marginBottom: 15, fontWeight: '500' },
  emptyText: { color: '#888', fontStyle: 'italic', textAlign: 'center', marginTop: 20 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 15, backgroundColor: '#f0f4f8', borderRadius: 8, marginBottom: 8 },
  itemText: { fontSize: 15, color: '#333', fontWeight: '500', flex: 1, marginRight: 10 },
  actionButtons: { flexDirection: 'row', alignItems: 'center' },
  deleteButton: { padding: 5, borderRadius: 5 },
  editButton: { padding: 5, borderRadius: 5, marginRight: 10 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  fabContainer: { position: 'absolute', bottom: 55, right: 20, flexDirection: 'row', zIndex: 10 },
  fab: { backgroundColor: '#217346', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 6 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  formContainer: { width: 320, backgroundColor: 'white', borderWidth: 2, borderColor: '#ccc', borderRadius: 10, padding: 20, elevation: 5 },
  formTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  label: { fontSize: 12, color: '#333', marginBottom: 2, marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#aaa', borderRadius: 5, paddingHorizontal: 10, paddingVertical: 5, fontSize: 14, backgroundColor: '#fff' },
  sizeContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: '#dc2626', padding: 10, marginTop: 10, borderRadius: 5 },
  sizeBox: { flex: 1 },
  xText: { marginHorizontal: 10, fontWeight: 'bold', fontSize: 16, marginTop: 15 },
  pickerContainer: { borderWidth: 1, borderColor: '#aaa', borderRadius: 5, backgroundColor: '#fff', height: 50, justifyContent: 'center' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 }
});
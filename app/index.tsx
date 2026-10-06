// import * as SQLite from "expo-sqlite";
// import React, { useEffect, useState } from "react";
// import {
//     FlatList,
//     StyleSheet,
//     Text,
//     TextInput,
//     TouchableOpacity,
//     View,
// } from "react-native";

// export default function App() {
//     const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);

//     const [nama, setNama] = useState("");
//     const [lokasi, setLokasi] = useState("");
//     const [pemilik, setPemilik] = useState("");

//     const [warung, setWarung] = useState<any[]>([]);

//     useEffect(() => {
//         initDatabase();
//     }, []);

//     async function initDatabase() {
//         const database = await SQLite.openDatabaseAsync("warung.db");

//         await database.execAsync(`
//       CREATE TABLE IF NOT EXISTS warung (
//         id INTEGER PRIMARY KEY AUTOINCREMENT,
//         nama TEXT NOT NULL,
//         lokasi TEXT NOT NULL,
//         pemilik TEXT NOT NULL
//       );
//     `);

//         setDb(database);

//         loadWarung(database);
//     }

//     async function loadWarung(database: SQLite.SQLiteDatabase = db!) {
//         const result = await database.getAllAsync(
//             "SELECT * FROM warung ORDER BY id DESC"
//         );

//         setWarung(result);
//     }

//     async function tambahWarung() {
//         if (!db) return;

//         if (!nama || !lokasi || !pemilik) {
//             alert("Semua data harus diisi");
//             return;
//         }

//         await db.runAsync(
//             "INSERT INTO warung (nama, lokasi, pemilik) VALUES (?, ?, ?)",
//             nama,
//             lokasi,
//             pemilik
//         );

//         setNama("");
//         setLokasi("");
//         setPemilik("");

//         loadWarung(db);
//     }

//     async function hapusWarung(id: number) {
//         if (!db) return;

//         await db.runAsync(
//             "DELETE FROM warung WHERE id = ?",
//             id
//         );

//         loadWarung(db);
//     }

//     // =========================
//     // UI
//     // =========================

//     return (
//         <View style={styles.container}>

//             <Text style={styles.title}>
//                 Catatan Warung Madura
//             </Text>

//             <TextInput
//                 style={styles.input}
//                 placeholder="Nama Warung"
//                 value={nama}
//                 onChangeText={setNama}
//             />

//             <TextInput
//                 style={styles.input}
//                 placeholder="Lokasi"
//                 value={lokasi}
//                 onChangeText={setLokasi}
//             />

//             <TextInput
//                 style={styles.input}
//                 placeholder="Nama Pemilik"
//                 value={pemilik}
//                 onChangeText={setPemilik}
//             />

//             <TouchableOpacity
//                 style={styles.button}
//                 onPress={tambahWarung}
//             >
//                 <Text style={styles.buttonText}>
//                     Tambah Warung
//                 </Text>
//             </TouchableOpacity>

//             <Text style={styles.subtitle}>
//                 Daftar Warung
//             </Text>

//             <FlatList
//                 data={warung}
//                 keyExtractor={(item) => item.id.toString()}
//                 renderItem={({ item }) => (
//                     <View style={styles.card}>

//                         <Text style={styles.nama}>
//                             {item.nama}
//                         </Text>

//                         <Text>
//                             Lokasi: {item.lokasi}
//                         </Text>

//                         <Text>
//                             Pemilik: {item.pemilik}
//                         </Text>

//                         <TouchableOpacity
//                             onPress={() => hapusWarung(item.id)}
//                         >
//                             <Text style={styles.delete}>
//                                 Hapus
//                             </Text>
//                         </TouchableOpacity>

//                     </View>
//                 )}
//             />

//         </View>
//     );
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         padding: 20,
//         paddingTop: 60,
//         backgroundColor: "#f5f5f5",
//     },

//     title: {
//         fontSize: 24,
//         fontWeight: "bold",
//         marginBottom: 20,
//     },

//     subtitle: {
//         fontSize: 18,
//         fontWeight: "bold",
//         marginTop: 25,
//         marginBottom: 10,
//     },

//     input: {
//         backgroundColor: "white",
//         borderWidth: 1,
//         borderColor: "#ddd",
//         borderRadius: 8,
//         padding: 12,
//         marginBottom: 10,
//     },

//     button: {
//         backgroundColor: "#222",
//         padding: 14,
//         borderRadius: 8,
//         alignItems: "center",
//     },

//     buttonText: {
//         color: "white",
//         fontWeight: "bold",
//     },

//     card: {
//         backgroundColor: "white",
//         padding: 15,
//         borderRadius: 10,
//         marginBottom: 10,
//     },

//     nama: {
//         fontSize: 18,
//         fontWeight: "bold",
//         marginBottom: 5,
//     },

//     delete: {
//         color: "red",
//         marginTop: 10,
//         fontWeight: "bold",
//     },
// });

import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/test" />;
}
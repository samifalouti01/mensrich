import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useUser } from "../components/UserContext";
import "./OrderForm.css";

const commissionRates = {
  Distributeur: 0.11,
  Animateur: 0.13,
  "Animateur Junior": 0.16,
  "Animateur Senior": 0.18,
  Manager: 0.20,
  "Manager Junior": 0.23,
  "Manager Senior": 0.25,
};

const OrderForm = ({ product }) => {
  const [wilayas, setWilayas] = useState([
      { id: "1 Adrar", name: "Adrar" },
      { id: "2 Chlef", name: "Chlef" },
      { id: "3 Laghouat", name: "Laghouat" },
      { id: "4 Oum El Bouaghi", name: "Oum El Bouaghi" },
      { id: "5 Batna", name: "Batna" },
      { id: "6 Bejaia", name: "Bejaia" },
      { id: "7 Biskra", name: "Biskra" },
      { id: "8 Bechar", name: "Bechar" },
      { id: "9 Blida", name: "Blida" },
      { id: "10 Bouira", name: "Bouira" },
      { id: "11 Tamanrasset", name: "Tamanrasset" },
      { id: "12 Tebessa", name: "Tebessa" },
      { id: "13 Tlemcen", name: "Tlemcen" },
      { id: "14 Tiaret", name: "Tiaret" },
      { id: "15 Tizi Ouzou", name: "Tizi Ouzou" },
      { id: "16 Alger", name: "Alger Centre" },
      { id: "17 Djelfa", name: "Djelfa" },
      { id: "18 Jijel", name: "Jijel" },
      { id: "19 Setif", name: "Setif" },
      { id: "20 Saida", name: "Saida" },
      { id: "21 Skikda", name: "Skikda" },
      { id: "22 Sidi Bel Abbes", name: "Sidi Bel Abbes" },
      { id: "23 Annaba", name: "Annaba" },
      { id: "24 Guelma", name: "Guelma" },
      { id: "25 Constantine", name: "Constantine" },
      { id: "26 Medea", name: "Medea" },
      { id: "27 Mostaganem", name: "Mostaganem" },
      { id: "28 M'Sila", name: "M'Sila" },
      { id: "29 Mascara", name: "Mascara" },
      { id: "30 Ouargla", name: "Ouargla" },
      { id: "31 Oran", name: "Oran" },
      { id: "32 El Bayadh", name: "El Bayadh" },
      { id: "33 Illizi", name: "Illizi" },
      { id: "34 Bordj Bou Arreridj", name: "Bordj Bou Arreridj" },
      { id: "35 Boumerdes", name: "Boumerdes" },
      { id: "36 El Tarf", name: "El Tarf" },
      { id: "37 Tindouf", name: "Tindouf" },
      { id: "38 Tissemsilt", name: "Tissemsilt" },
      { id: "39 El Oued", name: "El Oued" },
      { id: "40 Khenchela", name: "Khenchela" },
      { id: "41 Souk Ahras", name: "Souk Ahras" },
      { id: "42 Tipaza", name: "Tipaza" },
      { id: "43 Mila", name: "Mila" },
      { id: "44 Ain Defla", name: "Ain Defla" },
      { id: "45 Naama", name: "Naama" },
      { id: "46 Ain Temouchent", name: "Ain Temouchent" },
      { id: "47 Ghardaia", name: "Ghardaia" },
      { id: "48 Relizane", name: "Relizane" },
      { id: "49 Timimoun", name: "Timimoun" },
      { id: "50 Bordj Badji Mokhtar", name: "Bordj Badji Mokhtar" },
      { id: "51 Ouled Djellal", name: "Ouled Djellal" },
      { id: "52 Beni Abbas", name: "Beni Abbas" },
      { id: "53 In Salah", name: "In Salah" },
      { id: "54 In Guezzam", name: "In Guezzam" },
      { id: "55 Touggourt", name: "Touggourt" },
      { id: "56 Djanet", name: "Djanet" },
      { id: "57 El M'Ghair", name: "El M'Ghair" },
      { id: "58 El Meniaa", name: "El Meniaa" }    
  ]);

  const [communes, setCommunes] = useState([]);
  const [selectedWilaya, setSelectedWilaya] = useState("");
  const [selectedCommune, setSelectedCommune] = useState("");
  const [deliveryType, setDeliveryType] = useState("desktop");
  const [userId, setUserId] = useState(null);
  const { level } = useUser();

  useEffect(() => {
    // Get user from localStorage
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserId(user.id);
    }
  }, []);

  const handleWilayaChange = (e) => {
    const wilayaId = e.target.value;
    setSelectedWilaya(wilayaId);

    const communeData = {
      "1 Adrar": ["1 Adrar", "1 Tamest", "1 Charouine", "1 Reggane", "1 In Zghmir", "1 Titt", "1 Qasr Kadour", "1 Tsabit", "1 Timimoun", "1 Ouled Said", "1 Zaouia Kounta"],
      "2 Chlef": ["2 Chlef", "2 Ténès", "2 Benairia", "2 El Karimia", "2 Tadjena", "2 Taougrite", "2 Beni Haoua", "2 Sobha", "2 Harchoun", "2 Ouled Fares"],
      "3 Laghouat": ["3 Laghouat", "3 Ksar El Hirane", "3 Ben Nacer Ben Chohra", "3 Sidi Makhlouf", "3 Hassi Delaa", "3 Hassi R'Mel", "3 Ain Madhi"],
      "4 Oum El Bouaghi": ["4 Oum El Bouaghi", "4 Ain Beida", "4 Souk Naamane", "4 Ain Fekroun", "4 Ain Babouche", "4 Sigus", "4 El Amiria"],
      "5 Batna": ["5 Batna", "5 Ain Touta", "5 Merouana", "5 El Guezar", "5 Arris", "5 Berriane", "5 N'Gaous", "5 Theniet El Abed"],
      "6 Bejaia": ["6 Bejaia", "6 Aokas", "6 Tazmalt", "6 Souk El Tenine", "6 Tichy", "6 Amizour", "6 Darguina", "6 Sidi Aich"],
      "7 Biskra": ["7 Biskra", "7 El Kantara", "7 Tolga", "7 Zeribet El Oued", "7 Ouled Djellal", "7 El Outaya", "7 Sidi Khaled", "7 M'Chounech"],
      "8 Bechar": ["8 Bechar", "8 Lahmar", "8 Beni Ounif", "8 Taghit", "8 Igli", "8 Abadla", "8 Ksabi"],
      "9 Blida": ["9 Blida", "9 Boufarik", "9 Beni Tamou", "9 Bougara", "9 Ouled Yaich", "9 Chréa", "9 Mouzaïa", "9 El Affroun"],
      "10 Bouira": ["10 Bouira", "10 Sour El Ghozlane", "10 Bordj Okhriss", "10 Kadiria", "10 El Hachimia", "10 Djebahia", "10 Haizer"],
      "11 Tamanrasset": ["11 Tamanrasset", "11 In Guezzam", "11 Tazrouk", "11 In Salah", "11 Inghar", "11 Ablessa"],
      "12 Tebessa": ["12 Tebessa", "12 Cheria", "12 Marsa Ben M'Hidi", "12 El Ma El Abiodh", "12 Boukhadra", "12 Kouif", "12 El Ouenza"],
      "13 Tlemcen": ["13 Tlemcen", "13 Remchi", "13 Ghazaouet", "13 Maghnia", "13 Honaine", "13 Ain Tallout", "13 Beni Snous", "13 Sebdou"],
      "14 Tiaret": ["14 Tiaret", "14 Mahdia", "14 Frenda", "14 Ain Deheb", "14 Rahouia", "14 Mechraa Sfa", "14 Guertoufa", "14 Zmalet El Emir Abdelkader"],
      "15 Tizi Ouzou": ["15 Tizi Ouzou", "15 Azazga", "15 Boghni", "15 Dra El Mizan", "15 Makouda", "15 Tizi Ghenif", "15 Beni Douala", "15 Beni Yenni"],
      "16 Alger": ["16 Alger Centre", "16 Bab El Oued", "16 Kouba", "16 Hussein Dey", "16 El Madania", "16 El Harrach", "16 Bir Mourad Rais", "16 El Biar"],
      "17 Djelfa": ["17 Djelfa", "17 Ain Oussera", "17 Hassi Bahbah", "17 Messad", "17 Sidi Ladjel", "17 Guettara", "17 Birine", "17 Dar Chioukh"],
      "18 Jijel": ["18 Jijel", "18 El Milia", "18 Taher", "18 Chekfa", "18 Ziamat", "18 Settara", "18 El Ancer", "18 Ouled Rabah"],
      "19 Setif": ["19 Setif", "19 El Eulma", "19 Ain Arnat", "19 Bouandas", "19 Beni Aziz", "19 Beidha Bordj", "19 Beni Oussine", "19 Beni Chebana"],
      "20 Saida": ["20 Saida", "20 Ain Lahdjar", "20 Bouktoub", "20 Doui Thabet", "20 Ouled Brahim", "20 Sidi Ahmed"],
      "21 Skikda": ["21 Skikda", "21 El Harrouch", "21 Tamalous", "21 Sidi Mechreg", "21 Collo", "21 Ben Azzouz", "21 Zitouna", "21 Ramdan Djamel"],
      "22 Sidi Bel Abbes": ["22 Sidi Bel Abbes", "22 Telagh", "22 Ain Thrid", "22 Sfisef", "22 Ras El Ma", "22 Ain Tindamine", "22 M'Cid"],
      "23 Annaba": ["23 Annaba", "23 El Hadjar", "23 Berrahal", "23 Ain Berda", "23 El Bouni", "23 Chetaibi"],
      "24 Guelma": ["24 Guelma", "24 Oued Zenati", "24 Hammam Debagh", "24 Nechmaya", "24 Ain Sandel", "24 Medjez Amar", "24 Bou Hamdane"],
      "25 Constantine": ["25 Constantine", "25 Ain Smara", "25 Didouche Mourad", "25 Ibn Ziad", "25 El Khroub", "25 Zighoud Youcef"],
      "26 Medea": ["26 Medea", "26 El Omaria", "26 Ouzera", "26 Ksar El Boukhari", "26 Berrouaghia", "26 Ouled Antar", "26 Chahbounia"],
      "27 Mostaganem": ["27 Mostaganem", "27 Ain Nouicy", "27 Mazagran", "27 Hassi Mamoucha", "27 Mesra", "27 Stidia"],
      "28 M'Sila": ["28 M'Sila", "28 Bousaada", "28 Ain El Melh", "28 Djebel Messaad", "28 Oultene", "28 Maadid", "28 Belaiba"],
      "29 Mascara": ["29 Mascara", "29 Ain Faras", "29 Ain Fares", "29 Bouhanifia", "29 El Gaada", "29 Hacine"],
      "30 Ouargla": ["30 Ouargla", "30 Touggourt", "30 El Borma", "30 M'Naguer", "30 Taibet", "30 Nezla"],
      "31 Oran": ["31 Oran", "31 Es Senia", "31 Hassi Mefsoukh", "31 Ain El Turk", "31 Boutlelis", "31 Bousfer", "31 Gdyel", "31 Mers El Kebir"],
      "32 El Bayadh": ["32 El Bayadh", "32 Brezina", "32 El Kheither", "32 Boualem", "32 Sidi Slimane"],
      "33 Illizi": ["33 Illizi", "33 In Amenas", "33 Debdeb", "33 Gassi Touil"],
      "34 Bordj Bou Arreridj": ["34 Bordj Bou Arreridj", "34 El Achir", "34 Djaafra", "34 Bordj Zemmoura", "34 Ras El Oued", "34 Medjana"],
      "35 Boumerdes": ["35 Boumerdes", "35 Boudouaou", "35 Dellys", "35 Zemmouri", "35 Si Mustapha", "35 Chabet El Ameur", "35 Tidjelabine"],
      "36 El Tarf": ["36 El Tarf", "36 Besbes", "36 El Kala", "36 Bouteldja", "36 Bouhadjar", "36 Chatt", "36 Ain Kerma"],
      "37 Tindouf": ["37 Tindouf", "37 Oum El Assel"],
      "38 Tissemsilt": ["38 Tissemsilt", "38 Lardjem", "38 Bordj Emir Abdelkader", "38 Theniet El Had"],
      "39 El Oued": ["39 El Oued", "39 Robbah", "39 Guemar", "39 Magrane", "39 Hassi Khalifa", "39 Debila"],
      "40 Khenchela": ["40 Khenchela", "40 Babar", "40 Kais", "40 M'Toussa", "40 Chelia", "40 Ouled Rechache"],
      "41 Souk Ahras": ["41 Souk Ahras", "41 Sidi Fredj", "41 Ouled Driss", "41 Mechrouha", "41 M'Daourouch"],
      "42 Tipaza": ["42 Tipaza", "42 Cherchell", "42 Gouraya", "42 Bou Ismail", "42 Hadjout", "42 Ahmer El Ain"],
      "43 Mila": ["43 Mila", "43 Telerghma", "43 Sidi Merouane", "43 Grarem Gouga", "43 Oued Seguen", "43 Ferdjioua"],
      "44 Ain Defla": ["44 Ain Defla", "44 Miliana", "44 El Abadia", "44 Khemis Miliana", "44 Hammam Righa"],
      "45 Naama": ["45 Naama", "45 Ain Sefra", "45 Sfissifa", "45 Mekmen Ben Amar"],
      "46 Ain Temouchent": ["46 Ain Temouchent", "46 El Malah", "46 Oulhaça", "46 Hammam Bou Hadjar", "46 Sidi Safi"],
      "47 Ghardaia": ["47 Ghardaia", "47 El Meniaa", "47 Berriane", "47 Metlili", "47 Sebseb"],
      "48 Relizane": ["48 Relizane", "48 Mazouna", "48 Oued Rhiou", "48 Sidi M'Hamed Ben Ali", "48 Zemmoura", "48 El Matmar"],
      "49 Timimoun": ["49 Timimoun", "49 Ouled Said", "49 Charouine", "49 Tinerkouk"],
      "50 Bordj Badji Mokhtar": ["50 Bordj Badji Mokhtar", "50 Tamanrasset", "50 In Guezzam"],
      "51 Ouled Djellal": ["51 Ouled Djellal", "51 Sidi Khaled", "51 Doucen", "51 Ras El Miad"],
      "52 Beni Abbas": ["52 Beni Abbas", "52 Tabelbala", "52 El Ouata", "52 Kerzaz"],
      "53 In Salah": ["53 In Salah", "53 Foggaret Ezzoua", "53 Hassi Lahdjar", "53 In Ghar"],
      "54 In Guezzam": ["54 In Guezzam", "54 Ablessa", "54 Tamanrasset"],
      "55 Touggourt": ["55 Touggourt", "55 M'Naguer", "55 Nezla", "55 Temacine", "55 Taibet", "55 El Hadjira"],
      "56 Djanet": ["56 Djanet", "56 Illizi", "56 Bordj El Haoues"],
      "57 El M'Ghair": ["57 El M'Ghair", "57 Oum Touyour", "57 Sidi Amrane", "57 Sidi Khouiled"],
      "58 El Meniaa": ["58 El Meniaa", "58 Hassi Gara", "58 Hassi Lahdjar", "58 Zelda"]
    };
    setCommunes(communeData[wilayaId] || []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      alert("Please log in to place an order.");
      return;
    }

    // Retrieve commission rate based on the level from localStorage or context
    const commissionRate = commissionRates[level] || commissionRates.Distributeur;
    const commission = product.price * commissionRate;

    const orderData = {
      name: e.target.name.value,
      phone: e.target.phone.value,
      wilaya: selectedWilaya,
      commune: selectedCommune,
      total_price: product.price.toString(),
      order_status: "Pending",
      product_image: product.product_image,
      user_id: userId,
      price: product.price.toString(),
      commission: commission.toFixed(2),
    };

    const { error } = await supabase.from("order").insert([orderData]);
    if (error) {
      alert("Error placing order: " + error.message);
    } else {
      alert("Order placed successfully!");
    }
  };

  return (
    <form className="order-form" onSubmit={handleSubmit}>
      <div className="inp">
        <label>إسم الزبون:</label>
        <input className="input-form" type="text" name="name" required />
      </div>
      <div className="inp">
        <label>رقم هاتف الزبون:</label>
        <input className="input-form" type="text" name="phone" required />
      </div>
      <div>
        <label>الولاية:</label>
        <select onChange={handleWilayaChange} required>
          <option value="">اختر الولاية</option>
          {wilayas.map((wilaya) => (
            <option key={wilaya.id} value={wilaya.id}>
              {wilaya.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>البلدية:</label>
        <select
          onChange={(e) => setSelectedCommune(e.target.value)}
          value={selectedCommune}
          required
        >
          <option value="">اختر البلدية</option>
          {communes.map((commune, index) => (
            <option key={index} value={commune}>
              {commune}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>نوع التوصيل:</label>
        <select
          onChange={(e) => setDeliveryType(e.target.value)}
          value={deliveryType}
        >
          <option value="desktop">توصيل للمكتب</option>
        </select>
      </div>
      <div>
        <p className="p-text">السعر الإجمالي: {(product.price * 100).toLocaleString()} دج</p>
      </div>
      <button className="btn-form" type="submit">شراء</button>
    </form>
  );
};

export default OrderForm;
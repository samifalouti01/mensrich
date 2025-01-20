import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useUser } from "../components/UserContext";
import { useTranslation } from 'react-i18next';
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
      { id: "1", name: "Adrar" },
      { id: "2", name: "Chlef" },
      { id: "3", name: "Laghouat" },
      { id: "4", name: "Oum El Bouaghi" },
      { id: "5", name: "Batna" },
      { id: "6", name: "Bejaia" },
      { id: "7", name: "Biskra" },
      { id: "8", name: "Bechar" },
      { id: "9", name: "Blida" },
      { id: "10", name: "Bouira" },
      { id: "11", name: "Tamanrasset" },
      { id: "12", name: "Tebessa" },
      { id: "13", name: "Tlemcen" },
      { id: "14", name: "Tiaret" },
      { id: "15", name: "Tizi Ouzou" },
      { id: "16", name: "Algiers Centre" },
      { id: "17", name: "Djelfa" },
      { id: "18", name: "Jijel" },
      { id: "19", name: "Setif" },
      { id: "20", name: "Saida" },
      { id: "21", name: "Skikda" },
      { id: "22", name: "Sidi Bel Abbes" },
      { id: "23", name: "Annaba" },
      { id: "24", name: "Guelma" },
      { id: "25", name: "Constantine" },
      { id: "26", name: "Medea" },
      { id: "27", name: "Mostaganem" },
      { id: "28", name: "M'Sila" },
      { id: "29", name: "Mascara" },
      { id: "30", name: "Ouargla" },
      { id: "31", name: "Oran" },
      { id: "32", name: "El Bayadh" },
      { id: "33", name: "Illizi" },
      { id: "34", name: "Bordj Bou Arreridj" },
      { id: "35", name: "Boumerdes" },
      { id: "36", name: "El Tarf" },
      { id: "37", name: "Tindouf" },
      { id: "38", name: "Tissemsilt" },
      { id: "39", name: "El Oued" },
      { id: "40", name: "Khenchela" },
      { id: "41", name: "Souk Ahras" },
      { id: "42", name: "Tipaza" },
      { id: "43", name: "Mila" },
      { id: "44", name: "Ain Defla" },
      { id: "45", name: "Naama" },
      { id: "46", name: "Ain Temouchent" },
      { id: "47", name: "Ghardaia" },
      { id: "48", name: "Relizane" },
      { id: "49", name: "Timimoun" },
      { id: "50", name: "Bordj Badji Mokhtar" },
      { id: "51", name: "Ouled Djellal" },
      { id: "52", name: "Beni Abbas" },
      { id: "53", name: "In Salah" },
      { id: "54", name: "In Guezzam" },
      { id: "55", name: "Touggourt" },
      { id: "56", name: "Djanet" },
      { id: "57", name: "El M'Ghair" },
      { id: "58", name: "El Meniaa" }    
  ]);

  const [communes, setCommunes] = useState([]);
  const [selectedWilaya, setSelectedWilaya] = useState("");
  const [selectedCommune, setSelectedCommune] = useState("");
  const [deliveryType, setDeliveryType] = useState("desktop");
  const [userId, setUserId] = useState(null);
  const { level } = useUser();
  const { t, i18n } = useTranslation();

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
      '1': ["Adrar", "Tamest", "Charouine", "Reggane", "In Zghmir", "Titt", "Qasr Kadour", "Tsabit", "Timimoun", "Ouled Said", "Zaouia Kounta"],
        '2': ["Chlef", "Ténès", "Benairia", "El Karimia", "Tadjena", "Taougrite", "Beni Haoua", "Sobha", "Harchoun", "Ouled Fares"],
        '3': ["Laghouat", "Ksar El Hirane", "Ben Nacer Ben Chohra", "Sidi Makhlouf", "Hassi Delaa", "Hassi R'Mel", "Ain Madhi"],
        '4': ["Oum El Bouaghi", "Ain Beida", "Souk Naamane", "Ain Fekroun", "Ain Babouche", "Sigus", "El Amiria"],
        '5': ["Batna", "Ain Touta", "Merouana", "El Guezar", "Arris", "Berriane", "N'Gaous", "Theniet El Abed"],
        '6': ["Bejaia", "Aokas", "Tazmalt", "Souk El Tenine", "Tichy", "Amizour", "Darguina", "Sidi Aich"],
        '7': ["Biskra", "El Kantara", "Tolga", "Zeribet El Oued", "Ouled Djellal", "El Outaya", "Sidi Khaled", "M'Chounech"],
        '8': ["Bechar", "Lahmar", "Beni Ounif", "Taghit", "Igli", "Abadla", "Ksabi"],
        '9': ["Blida", "Boufarik", "Beni Tamou", "Bougara", "Ouled Yaich", "Chréa", "Mouzaïa", "El Affroun"],
        '10': ["Bouira", "Sour El Ghozlane", "Bordj Okhriss", "Kadiria", "El Hachimia", "Djebahia", "Haizer"],
        '11': ["Tamanrasset", "In Guezzam", "Tazrouk", "In Salah", "Inghar", "Ablessa"],
        '12': ["Tebessa", "Cheria", "Marsa Ben M'Hidi", "El Ma El Abiodh", "Boukhadra", "Kouif", "El Ouenza"],
        '13': ["Tlemcen", "Remchi", "Ghazaouet", "Maghnia", "Honaine", "Ain Tallout", "Beni Snous", "Sebdou"],
        '14': ["Tiaret", "Mahdia", "Frenda", "Ain Deheb", "Rahouia", "Mechraa Sfa", "Guertoufa", "Zmalet El Emir Abdelkader"],
        '15': ["Tizi Ouzou", "Azazga", "Boghni", "Dra El Mizan", "Makouda", "Tizi Ghenif", "Beni Douala", "Beni Yenni"],
        '16': ["Algiers Centre", "Bab El Oued", "Kouba", "Hussein Dey", "El Madania", "El Harrach", "Bir Mourad Rais", "El Biar"],
        '17': ["Djelfa", "Ain Oussera", "Hassi Bahbah", "Messad", "Sidi Ladjel", "Guettara", "Birine", "Dar Chioukh"],
        '18': ["Jijel", "El Milia", "Taher", "Chekfa", "Ziamat", "Settara", "El Ancer", "Ouled Rabah"],
        '19': ["Setif", "El Eulma", "Ain Arnat", "Bouandas", "Beni Aziz", "Beidha Bordj", "Beni Oussine", "Beni Chebana"],
        '20': ["Saida", "Ain Lahdjar", "Bouktoub", "Doui Thabet", "Ouled Brahim", "Sidi Ahmed"],
        '21': ["Skikda", "El Harrouch", "Tamalous", "Sidi Mechreg", "Collo", "Ben Azzouz", "Zitouna", "Ramdan Djamel"],
        '22': ["Sidi Bel Abbes", "Telagh", "Ain Thrid", "Sfisef", "Ras El Ma", "Ain Tindamine", "M'Cid"],
        '23': ["Annaba", "El Hadjar", "Berrahal", "Ain Berda", "El Bouni", "Chetaibi"],
        '24': ["Guelma", "Oued Zenati", "Hammam Debagh", "Nechmaya", "Ain Sandel", "Medjez Amar", "Bou Hamdane"],
        '25': ["Constantine", "Ain Smara", "Didouche Mourad", "Ibn Ziad", "El Khroub", "Zighoud Youcef"],
        '26': ["Medea", "El Omaria", "Ouzera", "Ksar El Boukhari", "Berrouaghia", "Ouled Antar", "Chahbounia"],
        '27': ["Mostaganem", "Ain Nouicy", "Mazagran", "Hassi Mamoucha", "Mesra", "Stidia"],
        '28': ["M'Sila", "Bousaada", "Ain El Melh", "Djebel Messaad", "Oultene", "Maadid", "Belaiba"],
        '29': ["Mascara", "Ain Faras", "Ain Fares", "Bouhanifia", "El Gaada", "Hacine"],
        '30': ["Ouargla", "Touggourt", "El Borma", "M'Naguer", "Taibet", "Nezla"],
        '31': ["Oran", "Es Senia", "Hassi Mefsoukh", "Ain El Turk", "Boutlelis", "Bousfer", "Gdyel", "Mers El Kebir"],
        '32': ["El Bayadh", "Brezina", "El Kheither", "Boualem", "Sidi Slimane"],
        '33': ["Illizi", "In Amenas", "Debdeb", "Gassi Touil"],
        '34': ["Bordj Bou Arreridj", "El Achir", "Djaafra", "Bordj Zemmoura", "Ras El Oued", "Medjana"],
        '35': ["Boumerdes", "Boudouaou", "Dellys", "Zemmouri", "Si Mustapha", "Chabet El Ameur", "Tidjelabine"],
        '36': ["El Tarf", "Besbes", "El Kala", "Bouteldja", "Bouhadjar", "Chatt", "Ain Kerma"],
        '37': ["Tindouf", "Oum El Assel"],
        '38': ["Tissemsilt", "Lardjem", "Bordj Emir Abdelkader", "Theniet El Had"],
        '39': ["El Oued", "Robbah", "Guemar", "Magrane", "Hassi Khalifa", "Debila"],
        '40': ["Khenchela", "Babar", "Kais", "M'Toussa", "Chelia", "Ouled Rechache"],
        '41': ["Souk Ahras", "Sidi Fredj", "Ouled Driss", "Mechrouha", "M'Daourouch"],
        '42': ["Tipaza", "Cherchell", "Gouraya", "Bou Ismail", "Hadjout", "Ahmer El Ain"],
        '43': ["Mila", "Telerghma", "Sidi Merouane", "Grarem Gouga", "Oued Seguen", "Ferdjioua"],
        '44': ["Ain Defla", "Miliana", "El Abadia", "Khemis Miliana", "Hammam Righa"],
        '45': ["Naama", "Ain Sefra", "Sfissifa", "Mekmen Ben Amar"],
        '46': ["Ain Temouchent", "El Malah", "Oulhaça", "Hammam Bou Hadjar", "Sidi Safi"],
        '47': ["Ghardaia", "El Meniaa", "Berriane", "Metlili", "Sebseb"],
        '48': ["Relizane", "Mazouna", "Oued Rhiou", "Sidi M'Hamed Ben Ali", "Zemmoura", "El Matmar"],
        '49': ["Timimoun", "Ouled Said", "Charouine", "Tinerkouk"],
        '50': ["Bordj Badji Mokhtar", "Tamanrasset", "In Guezzam"],
        '51': ["Ouled Djellal", "Sidi Khaled", "Doucen", "Ras El Miad"],
        '52': ["Beni Abbas", "Tabelbala", "El Ouata", "Kerzaz"],
        '53': ["In Salah", "Foggaret Ezzoua", "Hassi Lahdjar", "In Ghar"],
        '54': ["In Guezzam", "Ablessa", "Tamanrasset"],
        '55': ["Touggourt", "M'Naguer", "Nezla", "Temacine", "Taibet", "El Hadjira"],
        '56': ["Djanet", "Illizi", "Bordj El Haoues"],
        '57': ["El M'Ghair", "Oum Touyour", "Sidi Amrane", "Sidi Khouiled"],
        '58': ["El Meniaa", "Hassi Gara", "Hassi Lahdjar", "Zelda"]
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

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <form className="order-form" onSubmit={handleSubmit}>
      <div>
        <label>{t("name")}:</label>
        <input className="input-form" type="text" name="name" required />
      </div>
      <div>
        <label>{t("phoneNumber")}:</label>
        <input className="input-form" type="text" name="phone" required />
      </div>
      <div>
        <label>{t("wilaya")}:</label>
        <select onChange={handleWilayaChange} required>
          <option value="">{t("selectWilaya")}</option>
          {wilayas.map((wilaya) => (
            <option key={wilaya.id} value={wilaya.id}>
              {wilaya.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>{t("commune")}:</label>
        <select
          onChange={(e) => setSelectedCommune(e.target.value)}
          value={selectedCommune}
          required
        >
          <option value="">{t("selectCommune")}</option>
          {communes.map((commune, index) => (
            <option key={index} value={commune}>
              {commune}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>{t("deliveryType")}:</label>
        <select
          onChange={(e) => setDeliveryType(e.target.value)}
          value={deliveryType}
        >
          <option value="desktop">{t("desktop")}</option>
        </select>
      </div>
      <div>
        <p className="p-text">{t("totalPrice")}: {(product.price * 100).toLocaleString()} DA</p>
      </div>
      <button className="btn-form" type="submit">{t("buy")}</button>
    </form>
  );
};

export default OrderForm;
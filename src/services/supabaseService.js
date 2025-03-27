import { supabase } from "../supabaseClient";

// Fetch user's direct commission from their own validated orders with percentage
export const fetchUserCommission = async (userId, userLevel) => {
  const { data: orders, error } = await supabase
    .from("order")
    .select("commission, order_status")
    .eq("user_id", userId)
    .eq("order_status", "validated"); // Only validated orders

  if (error) {
    console.error("Error fetching direct commissions:", error);
    return 0;
  }

  // Sum commissions with percentage applied (assuming user's level applies to themselves)
  const totalDirectCommission = orders.reduce((sum, order) => {
    const commission = parseFloat(order.commission) || 0;
    const percentage = 10; // Default 10% for direct commission (adjust if needed)
    const earnings = (commission * percentage) / 100;
    return sum + earnings;
  }, 0);

  console.log(`Direct Commission for ${userId}: ${totalDirectCommission}`);
  return totalDirectCommission;
};

// Fetch team earnings from referrals' validated orders with percentage
export const fetchTeamEarnings = async (currentUserId, userLevel, determineLevel, getCommission) => {
  // Step 1: Fetch all users whose parrain_id includes the current user_id
  const { data: userData, error: userError } = await supabase
    .from("user_data")
    .select("id, parrain_id");

  if (userError) {
    console.error("Error fetching user data for team earnings:", userError);
    return 0;
  }

  const referralIds = userData
    .filter((user) => {
      const parrainIds = user.parrain_id
        ? user.parrain_id.split(",").map((id) => id.trim())
        : [];
      return parrainIds.includes(currentUserId);
    })
    .map((user) => user.id);

  if (referralIds.length === 0) {
    console.log("No referrals found for this user.");
    return 0;
  }

  // Step 2: Fetch validated orders and PPCG for these referral IDs
  const { data: orders, error: orderError } = await supabase
    .from("order")
    .select("commission, order_status, user_id")
    .in("user_id", referralIds)
    .eq("order_status", "validated"); // Only validated orders

  if (orderError) {
    console.error("Error fetching referral orders:", orderError);
    return 0;
  }

  // Step 3: Calculate earnings with percentage for each referral
  const totalTeamEarnings = await Promise.all(
    orders.map(async (order) => {
      const referralId = order.user_id;
      const { data: ppcgData, error: ppcgError } = await supabase
        .from("history_data")
        .select("ppcg")
        .eq("id", referralId);

      if (ppcgError) {
        console.error(`Error fetching PPCG for referral ${referralId}:`, ppcgError);
        return 0;
      }

      const totalPpcg = ppcgData.reduce((acc, record) => acc + (parseFloat(record.ppcg) || 0), 0);
      const referralLevel = determineLevel(totalPpcg);
      const percentage = getCommission(userLevel, referralLevel);
      const commission = parseFloat(order.commission) || 0;
      const earnings = (commission * percentage) / 100;
      return earnings;
    })
  ).then((earningsArray) => earningsArray.reduce((sum, earning) => sum + earning, 0));

  console.log(`Team Earnings from referrals: ${totalTeamEarnings}`);
  return totalTeamEarnings;
};

// Fetch user data and PPCG
export const fetchUserData = async (
  setUserId,
  setUserData,
  setDirectCommission,
  setIncome,
  setIsLoading,
  calculateUserStatus,
  determineLevel,
  getCommission
) => {
  setIsLoading(true);
  const currentUser = JSON.parse(localStorage.getItem("user"));
  if (!currentUser) {
    alert("Please log in.");
    return;
  }

  const currentUserId = String(currentUser.id);
  setUserId(currentUserId);

  const { data: userPpcgData, error: userPpcgError } = await supabase
    .from("history_data")
    .select("ppcg")
    .eq("id", currentUserId);

  if (userPpcgError) {
    console.error("Error fetching PPCG from history_data:", userPpcgError);
    return;
  }

  const totalPpcg = userPpcgData.reduce((acc, record) => acc + (parseFloat(record.ppcg) || 0), 0);
  const userLevel = determineLevel(totalPpcg);

  const { data: userData, error: userError } = await supabase
    .from("user_data")
    .select("id, parrain_id, parainage_users, perso")
    .eq("id", currentUserId)
    .single();

  if (userError) {
    console.error("Error fetching user data:", userError);
    return;
  }

  const updatedUserData = {
    ...userData,
    ppcg: totalPpcg,
    userStatus: calculateUserStatus(userData.perso, userLevel),
  };
  setUserData(updatedUserData);

  const directCommission = await fetchUserCommission(currentUserId, userLevel);
  const teamEarnings = await fetchTeamEarnings(currentUserId, userLevel, determineLevel, getCommission);
  const totalIncome = directCommission + teamEarnings;
  setDirectCommission(directCommission);
  setIncome(totalIncome);

  setIsLoading(false);
};

// Fetch referrals and their commission-based earnings from validated orders with percentage
export const fetchReferrals = async (
  userId,
  userPpcg,
  setReferrals,
  determineLevel,
  getCommission
) => {
  if (!userId) return;

  const { data: userData, error: userError } = await supabase
    .from("user_data")
    .select("id, name, parrain_id, perso");

  if (userError) {
    console.error("Error fetching referrals:", userError);
    return;
  }

  const filteredReferrals = userData?.filter((user) => {
    const parrainIds = user.parrain_id
      ? user.parrain_id.split(",").map((id) => id.trim())
      : [];
    return parrainIds.includes(userId);
  }) || [];

  const userLevel = determineLevel(userPpcg);

  const referralsWithDetails = await Promise.all(
    filteredReferrals.map(async (referral) => {
      // Fetch PPCG for level determination
      const { data: ppcgData, error: ppcgError } = await supabase
        .from("history_data")
        .select("ppcg")
        .eq("id", referral.id);

      if (ppcgError) {
        console.error(`Error fetching PPCG for referral ${referral.id}:`, ppcgError);
      }

      const totalPpcg = ppcgError
        ? 0
        : ppcgData.reduce((acc, record) => acc + (parseFloat(record.ppcg) || 0), 0);

      // Fetch commission from validated orders for this referral
      const { data: orders, error: orderError } = await supabase
        .from("order")
        .select("commission, order_status")
        .eq("user_id", referral.id)
        .eq("order_status", "validated"); // Only validated orders

      if (orderError) {
        console.error(`Error fetching orders for referral ${referral.id}:`, orderError);
        return { ...referral, ppcg: totalPpcg, referralIncome: 0 };
      }

      // Calculate referral income with percentage
      const referralLevel = determineLevel(totalPpcg);
      const percentage = getCommission(userLevel, referralLevel);
      const referralIncome = orders.reduce((sum, order) => {
        const commission = parseFloat(order.commission) || 0;
        const earnings = (commission * percentage) / 100;
        return sum + earnings;
      }, 0);

      console.log(`Referral ${referral.name}: PPCG=${totalPpcg}, Commission=${referralIncome}, Level=${referralLevel}, Percentage=${percentage}%`);
      return { ...referral, ppcg: totalPpcg, referralIncome };
    })
  );

  setReferrals(referralsWithDetails);
};
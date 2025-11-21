import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    getDealerSessions,
    getDealerSessionBids,
    getDealerSessionDetails,
    submitReverseBid,
    withdrawReverseBid,
    getEligibleProducts,
    getWonSessions,
    getMyReverseBids,
} from '@/lib/api';

// Transform API session data to UI format
// Rely fully on API's time_remaining object - no browser time calculations
const transformSession = (apiSession, currentDealerId = null) => {
    const criteria = apiSession.criteria || {};
    const vehicleName = criteria.make && criteria.model 
        ? `${criteria.make} ${criteria.model}` 
        : 'Vehicle';
    
    // Rely fully on API's time_remaining object
    const timeRemaining = apiSession.time_remaining || {};
    const isExpired = timeRemaining.expired === true;
    
    // Use formatted time from API if available
    let timeLeft = 'N/A';
    let timeLeftSeconds = 0;
    if (isExpired) {
        timeLeft = 'Expired';
        timeLeftSeconds = 0;
    } else if (timeRemaining.formatted) {
        timeLeft = timeRemaining.formatted;
        timeLeftSeconds = timeRemaining.seconds || 0;
    } else if (timeRemaining.seconds) {
        // If we have seconds but no formatted, calculate display format
        const hours = Math.floor(timeRemaining.seconds / 3600);
        const minutes = Math.floor((timeRemaining.seconds % 3600) / 60);
        const seconds = timeRemaining.seconds % 60;
        timeLeft = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        timeLeftSeconds = timeRemaining.seconds;
    }
    
    return {
        id: apiSession.id,
        sessionId: `RB-${String(apiSession.id).padStart(6, '0')}`,
        vehicle: vehicleName,
        year: criteria.year || 'N/A',
        model: criteria.model || 'N/A',
        make: criteria.make || 'N/A',
        price: criteria.price ? parseFloat(criteria.price) : null,
        timeLeft: timeLeft,
        timeLeftSeconds: timeLeftSeconds,
        timeRemainingFormatted: timeRemaining.formatted || null,
        isExpired: isExpired,
        expiresAt: apiSession.end_at,
        startAt: apiSession.start_at,
        status: apiSession.status === 'running' ? 'active' : (apiSession.status === 'closed' ? 'ended' : apiSession.status),
        condition: criteria.new_used === 'N' ? 'New' : 'Used',
        sessionDuration: apiSession.duration_hours ? `${apiSession.duration_hours} hours` : '24 hours',
        createdAt: apiSession.created_at,
        updatedAt: apiSession.updated_at,
        criteria: criteria,
        zipCode: apiSession.zip_code || criteria.zip_code || 'N/A',
        city: apiSession.city || null,
        state: apiSession.state || null,
        radius: criteria.radius || null,
        dealerPreference: apiSession.dealer_preference || 'all',
        alternativeMakesModels: apiSession.alternative_makes_models || [],
        primaryVehicleId: apiSession.primary_vehicle_id,
        primaryVehicleImage: apiSession.primary_vehicle_image || null,
        alternativeVehicleIds: apiSession.alternative_vehicle_ids || [],
        totalBids: parseInt(apiSession.total_bids) || 0,
        dealerBidCount: parseInt(apiSession.dealer_bid_count) || 0,
        winningBidId: apiSession.winning_bid_id || null,
        winningBidProductId: apiSession.winning_bid?.product_id || null,
        winningBid: apiSession.winning_bid || null,
        customerUserId: apiSession.customer_user_id || null,
        customer_user_id: apiSession.customer_user_id || null,
        customerContact: apiSession.customer_contact || null,
        leaderboard: transformLeaderboard(apiSession.leaderboard || [], currentDealerId), // Transform leaderboard with dealer info
        timeRemainingData: timeRemaining, // Store full time_remaining object for live countdown
        wonAt: apiSession.won_at || null, // Include won_at timestamp for won sessions
    };
};

// Transform leaderboard data from API
const transformLeaderboard = (leaderboardData, currentDealerId) => {
    if (!leaderboardData || !Array.isArray(leaderboardData)) {
        return [];
    }
    
    return leaderboardData
        .map((bid, index) => {
            // Format perks nicely - handle both object and string formats
            let perks = 'No perks';
            if (bid.perks) {
                if (typeof bid.perks === 'string') {
                    try {
                        // Try to parse if it's a JSON string
                        const parsed = JSON.parse(bid.perks);
                        if (typeof parsed === 'object') {
                            perks = Object.entries(parsed)
                                .map(([key, value]) => `${key}: ${value}`)
                                .join(', ');
                        } else {
                            perks = bid.perks;
                        }
                    } catch {
                        // If parsing fails, use as-is
                        perks = bid.perks;
                    }
                } else if (typeof bid.perks === 'object') {
                    // Format object as readable text
                    perks = Object.entries(bid.perks)
                        .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`)
                        .join(', ');
                }
            }
            
            const isCurrentDealer = bid.dealer_user_id === currentDealerId || 
                                   bid.dealer_id === currentDealerId ||
                                   String(bid.dealer_id) === String(currentDealerId);
            
            return {
                id: bid.id || bid.bid_id,
                bid_id: bid.id || bid.bid_id,
                dealerId: bid.dealer_user_id || bid.dealer_id,
                dealerName: bid.dealer_name || 'Unknown Dealer',
                dealerNameAnonymized: isCurrentDealer 
                    ? (bid.dealer_name || 'You')
                    : `Dealer ${String.fromCharCode(65 + index)}`,
                price: parseFloat(bid.amount || bid.price || 0),
                perks: perks,
                rank: bid.position || index + 1,
                submittedAt: bid.created_at || bid.submitted_at,
                isCurrentDealer: isCurrentDealer,
            };
        })
        .sort((a, b) => a.price - b.price) // Sort by price ascending (lower is better)
        .map((bid, index) => ({
            ...bid,
            rank: index + 1,
        }));
};

// Async thunk to fetch live reverse bidding sessions
export const fetchLiveSessions = createAsyncThunk(
    'reverseBidding/fetchLiveSessions',
    async (params = {}, { rejectWithValue, getState }) => {
        try {
            // Get current dealer ID from state
            const state = getState();
            const currentDealerId = state.user?.user?.ID || state.user?.user?.id;
            
            const response = await getDealerSessions(params);
            
            if (!response.success) {
                return rejectWithValue(response.message || 'Failed to fetch live sessions');
            }
            
            // Transform API response to UI format
            // The sessions array is nested at response.data.data
            const sessionsData = response.data?.data || response.data || [];
            const sessions = Array.isArray(sessionsData) 
                ? sessionsData.map(session => transformSession(session, currentDealerId))
                : [];
            
            return {
                success: true,
                sessions: sessions,
                total: response.data?.pagination?.total_items || response.total || sessions.length,
                pagination: response.data?.pagination || response.pagination,
            };
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch live sessions';
            return rejectWithValue(errorMessage);
        }
    }
);

// Async thunk to fetch session leaderboard
export const fetchSessionLeaderboard = createAsyncThunk(
    'reverseBidding/fetchSessionLeaderboard',
    async (sessionId, { rejectWithValue, getState }) => {
        try {
            // Get current dealer ID from state
            const state = getState();
            const currentDealerId = state.user?.user?.ID || state.user?.user?.id;
            
            // Fetch session details using the dedicated endpoint
            const sessionDetailsResponse = await getDealerSessionDetails(sessionId);
            
            if (!sessionDetailsResponse.success) {
                return rejectWithValue(sessionDetailsResponse.message || 'Failed to fetch session details');
            }
            
            // The session data is in response.data
            const sessionData = sessionDetailsResponse.data || sessionDetailsResponse;
            
            // Transform session data
            const session = sessionData ? transformSession(sessionData) : null;
            
            if (!session) {
                return rejectWithValue('Session not found');
            }
            
            // Get leaderboard from session data (it's already included in the API response)
            const leaderboardData = sessionData.leaderboard || [];
            const leaderboard = transformLeaderboard(
                Array.isArray(leaderboardData) ? leaderboardData : [], 
                currentDealerId
            );
            
            return {
                success: true,
                session: session,
                leaderboard: leaderboard,
                totalBids: session.totalBids || leaderboard.length,
            };
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch session leaderboard';
            return rejectWithValue(errorMessage);
        }
    }
);

// Async thunk to submit a bid
export const submitBid = createAsyncThunk(
    'reverseBidding/submitBid',
    async ({ sessionId, productId, bidAmount, perks }, { rejectWithValue, getState }) => {
        try {
            const state = getState();
            const currentDealerId = state.user?.user?.ID || state.user?.user?.id;
            
            // Prepare bid data
            const bidData = {
                product_id: productId,
                amount: parseFloat(bidAmount),
                perks: perks ? (typeof perks === 'string' ? { description: perks } : perks) : {},
            };
            
            // Submit bid via API
            const response = await submitReverseBid(sessionId, bidData);
            
            if (!response.success) {
                return rejectWithValue(response.message || 'Failed to submit bid');
            }
            
            // Transform leaderboard from response
            const leaderboard = transformLeaderboard(
                response.data?.leaderboard || [],
                currentDealerId
            );
            
            // Find the new bid in the leaderboard
            const newBid = leaderboard.find(bid => 
                bid.bid_id === response.data?.bid_id || 
                bid.isCurrentDealer === true
            );
            
            return {
                success: true,
                bid: newBid,
                sessionId: sessionId,
                leaderboard: leaderboard,
                position: response.data?.position || newBid?.rank || 0,
                message: response.message || 'Bid submitted successfully',
            };
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Failed to submit bid';
            return rejectWithValue(errorMessage);
        }
    }
);

// Async thunk to withdraw a bid
export const withdrawBid = createAsyncThunk(
    'reverseBidding/withdrawBid',
    async ({ sessionId, bidId }, { rejectWithValue }) => {
        try {
            const response = await withdrawReverseBid(bidId);
            
            if (!response.success) {
                return rejectWithValue(response.message || 'Failed to withdraw bid');
            }
            
            return {
                success: true,
                sessionId: sessionId,
                bidId: bidId,
                message: response.message || 'Bid withdrawn successfully',
            };
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Failed to withdraw bid';
            return rejectWithValue(errorMessage);
        }
    }
);

// Async thunk to fetch eligible products for a session
export const fetchEligibleProducts = createAsyncThunk(
    'reverseBidding/fetchEligibleProducts',
    async (sessionId, { rejectWithValue }) => {
        try {
            const response = await getEligibleProducts(sessionId);
            
            if (!response.success) {
                return rejectWithValue(response.message || 'Failed to fetch eligible products');
            }
            
            return {
                success: true,
                products: response.data?.products || [],
                criteria: response.data?.criteria || {},
            };
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch eligible products';
            return rejectWithValue(errorMessage);
        }
    }
);

// Async thunk to fetch won sessions
export const fetchWonSessions = createAsyncThunk(
    'reverseBidding/fetchWonSessions',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await getWonSessions(params);
            
            if (!response.success) {
                return rejectWithValue(response.message || 'Failed to fetch won sessions');
            }
            
            // Transform API response to UI format
            const sessionsData = response.data?.data || response.data || [];
            const sessions = Array.isArray(sessionsData) 
                ? sessionsData.map(transformSession)
                : [];
            
            return {
                success: true,
                sessions: sessions,
                total: response.data?.pagination?.total_items || response.total || sessions.length,
                pagination: response.data?.pagination || response.pagination,
            };
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch won sessions';
            return rejectWithValue(errorMessage);
        }
    }
);

// Async thunk to fetch my reverse bids
export const fetchMyReverseBids = createAsyncThunk(
    'reverseBidding/fetchMyReverseBids',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await getMyReverseBids(params);
            
            if (!response.success) {
                return rejectWithValue(response.message || 'Failed to fetch my reverse bids');
            }
            
            // The bids data is nested at response.data.data
            const bidsData = response.data?.data || response.data || [];
            
            return {
                success: true,
                bids: Array.isArray(bidsData) ? bidsData : [],
                total: response.data?.pagination?.total_items || response.total || bidsData.length,
                pagination: response.data?.pagination || response.pagination,
            };
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch my reverse bids';
            return rejectWithValue(errorMessage);
        }
    }
);

const initialState = {
    // Live sessions list
    sessions: [],
    sessionsLoading: false,
    sessionsError: null,

    // Won sessions list
    wonSessions: [],
    wonSessionsLoading: false,
    wonSessionsError: null,
    wonSessionsPagination: null,

    // My reverse bids list
    myReverseBids: [],
    myReverseBidsLoading: false,
    myReverseBidsError: null,
    myReverseBidsPagination: null,

    // Current session leaderboard
    currentSessionId: null,
    currentSession: null,
    leaderboard: [],
    leaderboardLoading: false,
    leaderboardError: null,

    // Bid operations
    bidOperationLoading: false,
    bidOperationError: null,
    bidOperationSuccess: false,
    
    // Eligible products
    eligibleProducts: [],
    eligibleProductsLoading: false,
    eligibleProductsError: null,
};

const reverseBiddingSlice = createSlice({
    name: 'reverseBidding',
    initialState,
    reducers: {
        clearSessionsError: (state) => {
            state.sessionsError = null;
        },
        clearLeaderboardError: (state) => {
            state.leaderboardError = null;
        },
        clearBidOperationStates: (state) => {
            state.bidOperationLoading = false;
            state.bidOperationError = null;
            state.bidOperationSuccess = false;
        },
        setCurrentSessionId: (state, action) => {
            state.currentSessionId = action.payload;
        },
        resetReverseBidding: (state) => {
            state.sessions = [];
            state.currentSessionId = null;
            state.currentSession = null;
            state.leaderboard = [];
            state.sessionsError = null;
            state.leaderboardError = null;
            state.bidOperationError = null;
        },
        // Update sessions from SSE events
        updateSessionsFromSSE: (state, action) => {
            const { sessions } = action.payload;
            if (Array.isArray(sessions)) {
                // Transform and update sessions
                state.sessions = sessions.map(transformSession);
            }
        },
        // Add new session from SSE
        addSessionFromSSE: (state, action) => {
            const session = transformSession(action.payload);
            // Check if session already exists
            const existingIndex = state.sessions.findIndex(s => s.id === session.id);
            if (existingIndex >= 0) {
                // Update existing session
                state.sessions[existingIndex] = session;
            } else {
                // Add new session (only if it's running/pending)
                if (session.status === 'active' || session.status === 'running' || session.status === 'pending') {
                    state.sessions.push(session);
                }
            }
        },
        // Remove session from SSE (when closed)
        removeSessionFromSSE: (state, action) => {
            const sessionId = action.payload;
            state.sessions = state.sessions.filter(s => s.id !== sessionId);
        },
        // Update single session from SSE
        updateSessionFromSSE: (state, action) => {
            const updatedSession = transformSession(action.payload);
            const index = state.sessions.findIndex(s => s.id === updatedSession.id);
            if (index >= 0) {
                state.sessions[index] = updatedSession;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch live sessions
            .addCase(fetchLiveSessions.pending, (state) => {
                state.sessionsLoading = true;
                state.sessionsError = null;
            })
            .addCase(fetchLiveSessions.fulfilled, (state, action) => {
                state.sessionsLoading = false;
                state.sessionsError = null;
                state.sessions = action.payload.sessions || [];
            })
            .addCase(fetchLiveSessions.rejected, (state, action) => {
                state.sessionsLoading = false;
                state.sessionsError = action.payload || 'Failed to fetch live sessions';
            })
            // Fetch session leaderboard
            .addCase(fetchSessionLeaderboard.pending, (state) => {
                state.leaderboardLoading = true;
                state.leaderboardError = null;
            })
            .addCase(fetchSessionLeaderboard.fulfilled, (state, action) => {
                state.leaderboardLoading = false;
                state.leaderboardError = null;
                state.currentSession = action.payload.session;
                state.currentSessionId = action.payload.session?.id || action.payload.session?.sessionId;
                state.leaderboard = action.payload.leaderboard || [];
            })
            .addCase(fetchSessionLeaderboard.rejected, (state, action) => {
                state.leaderboardLoading = false;
                state.leaderboardError = action.payload || 'Failed to fetch session leaderboard';
            })
            // Submit bid
            .addCase(submitBid.pending, (state) => {
                state.bidOperationLoading = true;
                state.bidOperationError = null;
                state.bidOperationSuccess = false;
            })
            .addCase(submitBid.fulfilled, (state, action) => {
                state.bidOperationLoading = false;
                state.bidOperationError = null;
                state.bidOperationSuccess = true;

                // Update leaderboard from API response
                if (action.payload.leaderboard) {
                    state.leaderboard = action.payload.leaderboard;
                } else if (action.payload.bid) {
                    // Fallback: add new bid to leaderboard and recalculate ranks
                    const newBid = action.payload.bid;
                    const updatedLeaderboard = [...state.leaderboard, newBid]
                        .sort((a, b) => a.price - b.price)
                        .map((bid, index) => ({
                            ...bid,
                            rank: index + 1,
                        }));
                    state.leaderboard = updatedLeaderboard;
                }
            })
            .addCase(submitBid.rejected, (state, action) => {
                state.bidOperationLoading = false;
                state.bidOperationError = action.payload || 'Failed to submit bid';
                state.bidOperationSuccess = false;
            })
            // Withdraw bid
            .addCase(withdrawBid.pending, (state) => {
                state.bidOperationLoading = true;
                state.bidOperationError = null;
                state.bidOperationSuccess = false;
            })
            .addCase(withdrawBid.fulfilled, (state, action) => {
                state.bidOperationLoading = false;
                state.bidOperationError = null;
                state.bidOperationSuccess = true;

                // Remove bid from leaderboard and recalculate ranks
                const updatedLeaderboard = state.leaderboard
                    .filter(bid => bid.id !== action.payload.bidId)
                    .map((bid, index) => ({
                        ...bid,
                        rank: index + 1,
                    }));

                state.leaderboard = updatedLeaderboard;
            })
            .addCase(withdrawBid.rejected, (state, action) => {
                state.bidOperationLoading = false;
                state.bidOperationError = action.payload || 'Failed to withdraw bid';
                state.bidOperationSuccess = false;
            })
            // Fetch eligible products
            .addCase(fetchEligibleProducts.pending, (state) => {
                state.eligibleProductsLoading = true;
                state.eligibleProductsError = null;
            })
            .addCase(fetchEligibleProducts.fulfilled, (state, action) => {
                state.eligibleProductsLoading = false;
                state.eligibleProductsError = null;
                state.eligibleProducts = action.payload.products || [];
            })
            .addCase(fetchEligibleProducts.rejected, (state, action) => {
                state.eligibleProductsLoading = false;
                state.eligibleProductsError = action.payload || 'Failed to fetch eligible products';
            })
            // Fetch won sessions
            .addCase(fetchWonSessions.pending, (state) => {
                state.wonSessionsLoading = true;
                state.wonSessionsError = null;
            })
            .addCase(fetchWonSessions.fulfilled, (state, action) => {
                state.wonSessionsLoading = false;
                state.wonSessionsError = null;
                state.wonSessions = action.payload.sessions || [];
                state.wonSessionsPagination = action.payload.pagination || null;
            })
            .addCase(fetchWonSessions.rejected, (state, action) => {
                state.wonSessionsLoading = false;
                state.wonSessionsError = action.payload || 'Failed to fetch won sessions';
            })
            // Fetch my reverse bids
            .addCase(fetchMyReverseBids.pending, (state) => {
                state.myReverseBidsLoading = true;
                state.myReverseBidsError = null;
            })
            .addCase(fetchMyReverseBids.fulfilled, (state, action) => {
                state.myReverseBidsLoading = false;
                state.myReverseBidsError = null;
                state.myReverseBids = action.payload.bids || [];
                state.myReverseBidsPagination = action.payload.pagination || null;
            })
            .addCase(fetchMyReverseBids.rejected, (state, action) => {
                state.myReverseBidsLoading = false;
                state.myReverseBidsError = action.payload || 'Failed to fetch my reverse bids';
            });
    },
});

export const {
    clearSessionsError,
    clearLeaderboardError,
    clearBidOperationStates,
    setCurrentSessionId,
    resetReverseBidding,
    updateSessionsFromSSE,
    addSessionFromSSE,
    removeSessionFromSSE,
    updateSessionFromSSE,
} = reverseBiddingSlice.actions;

// Selectors
export const selectSessions = (state) => state.reverseBidding.sessions;
export const selectSessionsLoading = (state) => state.reverseBidding.sessionsLoading;
export const selectSessionsError = (state) => state.reverseBidding.sessionsError;

export const selectCurrentSession = (state) => state.reverseBidding.currentSession;
export const selectLeaderboard = (state) => state.reverseBidding.leaderboard;
export const selectLeaderboardLoading = (state) => state.reverseBidding.leaderboardLoading;
export const selectLeaderboardError = (state) => state.reverseBidding.leaderboardError;

export const selectBidOperationLoading = (state) => state.reverseBidding.bidOperationLoading;
export const selectBidOperationError = (state) => state.reverseBidding.bidOperationError;
export const selectBidOperationSuccess = (state) => state.reverseBidding.bidOperationSuccess;

export const selectEligibleProducts = (state) => state.reverseBidding.eligibleProducts;
export const selectEligibleProductsLoading = (state) => state.reverseBidding.eligibleProductsLoading;
export const selectEligibleProductsError = (state) => state.reverseBidding.eligibleProductsError;

export const selectWonSessions = (state) => state.reverseBidding.wonSessions;
export const selectWonSessionsLoading = (state) => state.reverseBidding.wonSessionsLoading;
export const selectWonSessionsError = (state) => state.reverseBidding.wonSessionsError;
export const selectWonSessionsPagination = (state) => state.reverseBidding.wonSessionsPagination;

export const selectMyReverseBids = (state) => state.reverseBidding.myReverseBids;
export const selectMyReverseBidsLoading = (state) => state.reverseBidding.myReverseBidsLoading;
export const selectMyReverseBidsError = (state) => state.reverseBidding.myReverseBidsError;
export const selectMyReverseBidsPagination = (state) => state.reverseBidding.myReverseBidsPagination;

export default reverseBiddingSlice.reducer;


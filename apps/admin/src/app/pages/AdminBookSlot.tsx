import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, Phone, Mail, ChevronRight, ArrowLeft, Clock, Calendar as CalendarIcon, Check, IndianRupee } from 'lucide-react';

interface Player {
  id: number;
  name: string;
  phone: string;
  email: string;
}

interface TimeSlot {
  id: string;
  time: string;
  status: 'available' | 'booked' | 'blocked';
}

// Mock data
const mockPlayers: Player[] = [
  { id: 1, name: 'Rahul Sharma', phone: '+91 98765 43210', email: 'rahul@example.com' },
  { id: 2, name: 'Priya Patel', phone: '+91 98765 43211', email: 'priya@example.com' },
  { id: 3, name: 'Amit Kumar', phone: '+91 98765 43212', email: 'amit@example.com' },
  { id: 4, name: 'Sneha Reddy', phone: '+91 98765 43213', email: 'sneha@example.com' },
  { id: 5, name: 'Vikram Singh', phone: '+91 98765 43214', email: 'vikram@example.com' },
];

const mockGames = ['Badminton', 'Cricket', 'Football', 'Tennis'];
const mockCourts = {
  'Badminton': ['Badminton Court 1', 'Badminton Court 2', 'Badminton Court 3'],
  'Cricket': ['Cricket Net 1', 'Cricket Net 2'],
  'Football': ['Football Field 1'],
  'Tennis': ['Tennis Court 1', 'Tennis Court 2'],
};

const mockTimeSlots: TimeSlot[] = [
  { id: '1', time: '06:00', status: 'available' },
  { id: '2', time: '07:00', status: 'available' },
  { id: '3', time: '08:00', status: 'available' },
  { id: '4', time: '09:00', status: 'available' },
  { id: '5', time: '10:00', status: 'blocked' },
  { id: '6', time: '11:00', status: 'available' },
  { id: '7', time: '12:00', status: 'available' },
  { id: '8', time: '13:00', status: 'booked' },
  { id: '9', time: '14:00', status: 'available' },
  { id: '10', time: '15:00', status: 'available' },
  { id: '11', time: '16:00', status: 'available' },
  { id: '12', time: '17:00', status: 'booked' },
];

type Step = 'player' | 'slot' | 'confirmation';

export function AdminBookSlot() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>('player');
  
  // Step 1: Player Selection
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  
  // Step 2: Slot Booking
  const [selectedGame, setSelectedGame] = useState('');
  const [selectedCourt, setSelectedCourt] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  const filteredPlayers = mockPlayers.filter(player => 
    player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.phone.includes(searchTerm) ||
    player.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePlayerSelect = (player: Player) => {
    setSelectedPlayer(player);
  };

  const handleNextToSlotBooking = () => {
    if (selectedPlayer) {
      setCurrentStep('slot');
    }
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    if (slot.status === 'available') {
      setSelectedSlot(slot);
    }
  };

  const handleNextToConfirmation = () => {
    if (selectedGame && selectedCourt && selectedDate && selectedSlot) {
      setCurrentStep('confirmation');
    }
  };

  const handleConfirmBooking = () => {
    // Mock booking - in real app, this would call an API
    console.log({
      player: selectedPlayer,
      game: selectedGame,
      court: selectedCourt,
      date: selectedDate,
      slot: selectedSlot,
    });
    
    // Show success toast and redirect
    alert('Booking confirmed successfully!');
    navigate('/bookings');
  };

  const getSlotStatusStyles = (status: string) => {
    switch (status) {
      case 'available':
        return 'border-neutral-300 hover:border-blue-500 hover:bg-blue-50 cursor-pointer';
      case 'booked':
        return 'border-neutral-200 bg-neutral-100 text-neutral-400 cursor-not-allowed';
      case 'blocked':
        return 'border-red-200 bg-red-50 text-red-400 cursor-not-allowed';
      default:
        return '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => {
            if (currentStep === 'player') {
              navigate('/bookings');
            } else if (currentStep === 'slot') {
              setCurrentStep('player');
            } else {
              setCurrentStep('slot');
            }
          }}
          className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-neutral-600" />
        </button>
        <div>
          <h2 className="text-2xl font-semibold text-neutral-900">Book Slot for Player</h2>
          <p className="text-neutral-600 mt-1">Admin booking on behalf of player</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep === 'player' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
            }`}>
              {currentStep === 'player' ? '1' : <Check className="w-5 h-5" />}
            </div>
            <span className={`font-medium ${currentStep === 'player' ? 'text-blue-600' : 'text-green-600'}`}>
              Select Player
            </span>
          </div>
          <ChevronRight className="w-5 h-5 text-neutral-400" />
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep === 'slot' ? 'bg-blue-600 text-white' : 
              currentStep === 'confirmation' ? 'bg-green-600 text-white' : 
              'bg-neutral-200 text-neutral-600'
            }`}>
              {currentStep === 'confirmation' ? <Check className="w-5 h-5" /> : '2'}
            </div>
            <span className={`font-medium ${
              currentStep === 'slot' ? 'text-blue-600' : 
              currentStep === 'confirmation' ? 'text-green-600' : 
              'text-neutral-600'
            }`}>
              Book Slot
            </span>
          </div>
          <ChevronRight className="w-5 h-5 text-neutral-400" />
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep === 'confirmation' ? 'bg-blue-600 text-white' : 'bg-neutral-200 text-neutral-600'
            }`}>
              3
            </div>
            <span className={`font-medium ${currentStep === 'confirmation' ? 'text-blue-600' : 'text-neutral-600'}`}>
              Confirm
            </span>
          </div>
        </div>
      </div>

      {/* Step 1: Player Selection */}
      {currentStep === 'player' && (
        <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Search & Select Player</h3>
            
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search by name, phone, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Search Results */}
            <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
              {filteredPlayers.length > 0 ? (
                <>
                  {!searchTerm && (
                    <p className="text-sm text-neutral-500 mb-3">
                      Showing all players. Use search to filter.
                    </p>
                  )}
                  {filteredPlayers.map((player) => (
                    <button
                      key={player.id}
                      onClick={() => handlePlayerSelect(player)}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                        selectedPlayer?.id === player.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-neutral-200 hover:border-blue-300 hover:bg-neutral-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-neutral-400" />
                            <span className="font-medium text-neutral-900">{player.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-neutral-600">
                            <Phone className="w-3 h-3" />
                            {player.phone}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-neutral-600">
                            <Mail className="w-3 h-3" />
                            {player.email}
                          </div>
                        </div>
                        {selectedPlayer?.id === player.id && (
                          <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </>
              ) : (
                <div className="text-center py-8 text-neutral-500">
                  No players found matching "{searchTerm}"
                </div>
              )}
            </div>
          </div>

          {/* Selected Player Display */}
          {selectedPlayer && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-blue-700 font-medium mb-2">Selected Player</p>
              <div className="space-y-1">
                <p className="font-semibold text-neutral-900">{selectedPlayer.name}</p>
                <p className="text-sm text-neutral-600">{selectedPlayer.phone}</p>
                <p className="text-sm text-neutral-600">{selectedPlayer.email}</p>
              </div>
            </div>
          )}

          {/* Next Button */}
          <div className="flex justify-end">
            <button
              onClick={handleNextToSlotBooking}
              disabled={!selectedPlayer}
              className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next: Select Slot
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Slot Booking */}
      {currentStep === 'slot' && (
        <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-6">
          <h3 className="text-lg font-semibold text-neutral-900">Book Your Slot</h3>

          {/* Date Selection */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Select Date
            </label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Sport Selection */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Select Sport
            </label>
            <select
              value={selectedGame}
              onChange={(e) => {
                setSelectedGame(e.target.value);
                setSelectedCourt('');
              }}
              className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="">Choose a sport...</option>
              {mockGames.map((game) => (
                <option key={game} value={game}>{game}</option>
              ))}
            </select>
          </div>

          {/* Court Selection */}
          {selectedGame && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Select Court
              </label>
              <select
                value={selectedCourt}
                onChange={(e) => setSelectedCourt(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="">Choose a court...</option>
                {mockCourts[selectedGame as keyof typeof mockCourts]?.map((court) => (
                  <option key={court} value={court}>{court}</option>
                ))}
              </select>
            </div>
          )}

          {/* Available Slots */}
          {selectedGame && selectedCourt && selectedDate && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-3">
                Available Slots
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {mockTimeSlots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => handleSlotSelect(slot)}
                    disabled={slot.status !== 'available'}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedSlot?.id === slot.id
                        ? 'border-blue-500 bg-blue-50'
                        : getSlotStatusStyles(slot.status)
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">{slot.time}</span>
                    </div>
                    {slot.status === 'blocked' && (
                      <div className="text-xs mt-1 text-red-600">Blocked</div>
                    )}
                    {slot.status === 'booked' && (
                      <div className="text-xs mt-1 text-neutral-500">Booked</div>
                    )}
                  </button>
                ))}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-neutral-300 rounded"></div>
                  <span className="text-neutral-600">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-neutral-100 border-2 border-neutral-200 rounded"></div>
                  <span className="text-neutral-600">Booked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-50 border-2 border-red-200 rounded"></div>
                  <span className="text-neutral-600">Blocked</span>
                </div>
              </div>
            </div>
          )}

          {/* Next Button */}
          <div className="flex justify-end">
            <button
              onClick={handleNextToConfirmation}
              disabled={!selectedGame || !selectedCourt || !selectedDate || !selectedSlot}
              className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next: Confirm Booking
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Confirmation */}
      {currentStep === 'confirmation' && (
        <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-6">
          <h3 className="text-lg font-semibold text-neutral-900">Confirm Booking</h3>

          {/* Booking Summary */}
          <div className="space-y-4">
            {/* Player Info */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-blue-700 font-medium mb-2">Player Details</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-neutral-600" />
                  <span className="font-semibold text-neutral-900">{selectedPlayer?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-neutral-600" />
                  <span className="text-sm text-neutral-600">{selectedPlayer?.phone}</span>
                </div>
              </div>
            </div>

            {/* Booking Info */}
            <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200 space-y-3">
              <div className="flex justify-between">
                <span className="text-neutral-600">Sport</span>
                <span className="font-medium text-neutral-900">{selectedGame}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Court</span>
                <span className="font-medium text-neutral-900">{selectedCourt}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Date</span>
                <span className="font-medium text-neutral-900">
                  {new Date(selectedDate).toLocaleDateString('en-IN', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Time</span>
                <span className="font-medium text-neutral-900">{selectedSlot?.time}</span>
              </div>
              <div className="border-t border-neutral-300 pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-neutral-900">Total Amount</span>
                  <span className="text-2xl font-bold text-blue-600 flex items-center">
                    <IndianRupee className="w-5 h-5" />
                    {selectedGame === 'Badminton' ? '500' : selectedGame === 'Cricket' ? '800' : '1200'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Note */}
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> This booking is being created by admin on behalf of the player.
            </p>
          </div>

          {/* Confirm Button */}
          <div className="flex gap-3">
            <button
              onClick={() => setCurrentStep('slot')}
              className="flex-1 px-6 py-2.5 rounded-lg border border-neutral-300 text-neutral-700 font-medium hover:bg-neutral-50 transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={handleConfirmBooking}
              className="flex-1 px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
            >
              Confirm Booking
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
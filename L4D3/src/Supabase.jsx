import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import './Cards.css'

function Supabase() {
  const navigate = useNavigate()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingItemId, setEditingItemId] = useState(null)
  const [flippedCards, setFlippedCards] = useState(new Set())
  const [showAddModal, setShowAddModal] = useState(false)
  const [newCharacter, setNewCharacter] = useState({
    name: '',
    class: '',
    speed: '',
    attack: '',
    hp: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('L4D3DB')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(4)
      
      if (error) throw error
      
      setData(data || [])
      
      // Keep the predefined character structure
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function insertData(characterData) {
    try {
      const { data, error } = await supabase
        .from('L4D3DB')
        .insert([characterData])
        .select()
      
      if (error) throw error
      
      // Reset form and close modal
      setNewCharacter({
        name: '',
        class: '',
        speed: '',
        attack: '',
        hp: ''
      })
      setShowAddModal(false)
      
      // Navigate to summary page after successful insert
      navigate('/summary')
    } catch (error) {
      setError(error.message)
    }
  }

  function openAddModal() {
    setShowAddModal(true)
  }

  function closeAddModal() {
    setShowAddModal(false)
    setNewCharacter({
      name: '',
      class: '',
      speed: '',
      attack: '',
      hp: ''
    })
  }

  function handleNewCharacterChange(field, value) {
    setNewCharacter(prev => ({
      ...prev,
      [field]: value
    }))
  }

  function handleAddCharacter() {
    if (!newCharacter.name?.trim()) {
      alert('Please enter a character name')
      return
    }
    if (!newCharacter.class) {
      alert('Please select a character class')
      return
    }
    insertData({ ...newCharacter, created_at: new Date() })
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this item?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('L4D3DB')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      // Update local state
      setData(prevData => prevData.filter(item => item.id !== id))
    } catch (error) {
      setError(error.message)
    }
  }

  function handleEdit(itemId) {
    setEditingItemId(itemId)
  }

  function toggleCardFlip(cardId) {
    setFlippedCards(prev => {
      const newSet = new Set(prev)
      if (newSet.has(cardId)) {
        newSet.delete(cardId)
      } else {
        newSet.add(cardId)
      }
      return newSet
    })
  }

  async function handleFieldUpdate(itemId, field, value) {
    try {
      const { data: updatedData, error } = await supabase
        .from('L4D3DB')
        .update({ [field]: value })
        .eq('id', itemId)
        .select()
      
      if (error) throw error
      
      // Update local state
      setData(prevData => 
        prevData.map(item => 
          item.id === itemId ? updatedData[0] : item
        )
      )
    } catch (error) {
      setError(error.message)
    }
  }

  function handleStopEdit() {
    setEditingItemId(null)
  }

  if (loading) return <div className="loading-container">Loading...</div>
  if (error) return <div className="error-container">Error: {error}</div>

  return (
    <div>
      <div className="header-section">
        <a 
          href="https://store.steampowered.com/app/550/Left_4_Dead_2/" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          <img 
            src="/logo.jpg" 
            alt="Left 4 Dead 3 Logo" 
            className="main-logo"
          />
        </a>
      </div>
      
      <div className="cards-container">
        {data.map((item, index) => (
          <div 
            key={item.id || index} 
            className={`card ${flippedCards.has(item.id) ? 'flipped' : ''}`}
            onClick={() => toggleCardFlip(item.id)}
          >
            <div className="card-inner">
              <div className="card-front">
                {/* Only show the correct image for the 4 main characters, otherwise show a default/class image */}
                {(() => {
                  const mainChars = ['zoey', 'ellis', 'boomer', 'hunter'];
                  const name = item.name?.toLowerCase();
                  if (mainChars.includes(name)) {
                    return (
                      <img
                        src={`/${name}.jpg`}
                        alt={`${item.name || 'Character'} Image`}
                      />
                    );
                  } else {
                    // Show a class-based image or a generic placeholder
                    const classImg = item.class?.toLowerCase();
                    return (
                      <img
                        src={`/${classImg ? classImg : 'default'}.jpg`}
                        alt="Default Character Image"
                      />
                    );
                  }
                })()}
              </div>
              <div className="card-back">
                <div className="card-header">
                  <h3 className="card-title">
                    {editingItemId === item.id ? (
                      <input
                        type="text"
                        value={item.name || item.title || `Entry #${item.id || index + 1}`}
                        onChange={(e) => handleFieldUpdate(item.id, 'name', e.target.value)}
                        className="edit-input-title"
                      />
                    ) : (
                      item.name || item.title || `Entry #${item.id || index + 1}`
                    )}
                  </h3>
                </div>
                <div className="card-content">
                  {Object.entries(item).map(([key, value]) => {
                    // Skip displaying certain technical fields in the main view
                    if (key === 'id' || key === 'created_at' || key === 'updated_at') {
                      return null;
                    }
                    return (
                      <div key={key} className="card-field">
                        <label className="card-label">
                          {key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}:
                        </label>
                        <div className="card-value">
                          {editingItemId === item.id ? (
                            <input
                              type="text"
                              value={value || ''}
                              onChange={(e) => handleFieldUpdate(item.id, key, e.target.value)}
                              className="edit-input"
                            />
                          ) : (
                            value || 'No data'
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="card-actions">
                  {/* Edit and Delete buttons removed for individual pages */}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div style={{ textAlign: 'center', marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <button 
          className="card-button"
          onClick={openAddModal}
          style={{ 
            fontSize: '1.2rem', 
            padding: '0.8rem 4rem', 
            backgroundColor: 'red', 
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
            minWidth: '300px',
            height: '50px'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#cc0000'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'red'}
        >
          Add New Character
        </button>

        <button 
          className="card-button"
          onClick={() => navigate('/summary')}
          style={{ 
            fontSize: '1.2rem', 
            padding: '0.8rem 4rem', 
            backgroundColor: '#333', 
            color: 'white',
            border: '2px solid red',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
            minWidth: '300px',
            height: '50px'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#555'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#333'}
        >
          View All Characters
        </button>
      </div>

      {showAddModal && (
        <div className="edit-modal">
          <div className="edit-modal-content">
            <h3>Add New Character</h3>
            
            <div className="edit-field">
              <label>Character Name*:</label>
              <input
                type="text"
                value={newCharacter.name}
                onChange={(e) => handleNewCharacterChange('name', e.target.value)}
                placeholder="Enter character name (required)"
                className="edit-input"
                required
              />
            </div>

            <div className="edit-field">
              <label>Class*:</label>
              <select
                value={newCharacter.class}
                onChange={(e) => handleNewCharacterChange('class', e.target.value)}
                className="edit-input"
                required
              >
                <option value="">Select a class</option>
                <option value="Survivor">Survivor</option>
                <option value="Zombie">Zombie</option>
              </select>
            </div>

            <div className="edit-field">
              <label>Speed:</label>
              <input
                type="number"
                value={newCharacter.speed}
                onChange={(e) => handleNewCharacterChange('speed', e.target.value)}
                placeholder="Enter speed value (e.g., 10)"
                className="edit-input"
              />
            </div>

            <div className="edit-field">
              <label>Attack:</label>
              <input
                type="number"
                value={newCharacter.attack}
                onChange={(e) => handleNewCharacterChange('attack', e.target.value)}
                placeholder="Enter attack value (e.g., 15)"
                className="edit-input"
              />
            </div>

            <div className="edit-field">
              <label>Health Points (HP):</label>
              <input
                type="number"
                value={newCharacter.hp}
                onChange={(e) => handleNewCharacterChange('hp', e.target.value)}
                placeholder="Enter HP value (e.g., 100)"
                className="edit-input"
              />
            </div>

            <div className="edit-modal-actions">
              <button 
                onClick={handleAddCharacter}
                className="card-button card-button-primary"
                style={{ marginRight: '1rem' }}
              >
                Add Character
              </button>
              <button 
                onClick={closeAddModal}
                className="card-button card-button-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Supabase

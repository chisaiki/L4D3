import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import './Cards.css'

function CharacterDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [character, setCharacter] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingItemId, setEditingItemId] = useState(null)

  useEffect(() => {
    fetchCharacter()
  }, [id])

  async function fetchCharacter() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('L4D3DB')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      
      setCharacter(data)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this character?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('L4D3DB')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      // Navigate back to summary after deletion
      navigate('/summary')
    } catch (error) {
      setError(error.message)
    }
  }

  function handleEdit(itemId) {
    setEditingItemId(itemId)
  }

  async function handleFieldUpdate(itemId, field, value) {
    try {
      const { data: updatedData, error } = await supabase
        .from('L4D3DB')
        .update({ [field]: value })
        .eq('id', itemId)
        .select()
        .single()
      
      if (error) throw error
      
      // Update local state
      setCharacter(updatedData)
    } catch (error) {
      setError(error.message)
    }
  }

  function handleStopEdit() {
    setEditingItemId(null)
  }

  function goBackToSummary() {
    navigate('/summary')
  }

  if (loading) return <div className="loading-container">Loading character...</div>
  if (error) return <div className="error-container">Error: {error}</div>
  if (!character) return <div className="error-container">Character not found</div>

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

      <div className="character-detail-container">
        <button 
          className="back-button"
          onClick={goBackToSummary}
          style={{ marginBottom: '2rem' }}
        >
          ← Back to Summary
        </button>

        <div className="character-detail-card">
          <div className="character-image-section">
            {/* Special description for Ellis */}
            {character.name?.toLowerCase() === 'ellis' && (
              <div style={{ color: 'orange', fontWeight: 'bold', marginTop: '1rem', textAlign: 'center' }}>
                Goofy Savannah mechanic, beer fan, and storyteller—often distracted by wild tales about Keith or dreams of marrying Zoey.
              </div>
            )}
            {/* Special description for Zoey */}
            {character.name?.toLowerCase() === 'zoey' && (
              <div style={{ color: 'orange', fontWeight: 'bold', marginTop: '1rem', textAlign: 'center' }}>
                Zoey was once a student at Aldrich in Philadelphia under a scholarship to become a filmmaker but instead of attending classes, she spent her time watching horror films and justified this to her upset mother as doing some "research". She got her love for this film genre from her father who introduced her to movies featuring zombies, slasher murderers and extraterrestrials at a young age.
              </div>
            )}
            <img 
              src={`/${['zoey','ellis','nick','coach','hunter','boomer'].includes(character.name?.toLowerCase()) ? character.name?.toLowerCase() : character.class?.toLowerCase()}.jpg`}
              alt={`${character.name || 'Character'} Image`}
              className="character-detail-image"
            />
            {/* Special description for Boomer */}
            {character.name?.toLowerCase() === 'boomer' && (
              <div style={{ color: 'orange', fontWeight: 'bold', marginTop: '1rem', textAlign: 'center' }}>
                The Boomer is a Special Infected known for spitting a bile projectile at survivors, which temporarily blinds them and draws a horde of Common Infected. Physically, the Boomer is a bloated, decaying creature with a large belly and boils, indicating severe mutation from the infection. When killed, the Boomer explodes, releasing more bile.
              </div>
            )}
            {/* Special description for Hunter */}
            {character.name?.toLowerCase() === 'hunter' && (
              <div style={{ color: 'orange', fontWeight: 'bold', marginTop: '1rem', textAlign: 'center' }}>
                Often seen wearing a faded blue hooded sweatshirt and brown sweatpants, with duct tape securing the limbs. The Hunter's most distinctive feature is its ability to leap onto and pin down a Survivor, clawing at them until either the Survivor is freed by another player or the Hunter is killed.
              </div>
            )}
            {/* Special description for new Survivors with HP > 100 or < 100 */}
            {(
              !['zoey','ellis','nick','coach','hunter','boomer'].includes(character.name?.toLowerCase()) &&
              character.class?.toLowerCase() === 'survivor' &&
              Number(character.hp) > 100
            ) && (
              <div style={{ color: 'orange', fontWeight: 'bold', marginTop: '1rem', textAlign: 'center' }}>
                Wow! So much health. Are they actually a zombie?
              </div>
            )}
            {(
              !['zoey','ellis','nick','coach','hunter','boomer'].includes(character.name?.toLowerCase()) &&
              character.class?.toLowerCase() === 'survivor' &&
              Number(character.hp) < 100
            ) && (
              <div style={{ color: 'orange', fontWeight: 'bold', marginTop: '1rem', textAlign: 'center' }}>
                Oh No! Can this survivor even live through a zombie invasion?
              </div>
            )}
          </div>

          <div className="character-info-section">
            <div className="character-header">
              <h1 className="character-detail-title">
                {editingItemId === character.id ? (
                  <input
                    type="text"
                    value={character.name || ''}
                    onChange={(e) => handleFieldUpdate(character.id, 'name', e.target.value)}
                    className="edit-input-title"
                  />
                ) : (
                  character.name || 'Unknown Character'
                )}
              </h1>
            </div>

            <div className="character-stats">
              {Object.entries(character).map(([key, value]) => {
                if (key === 'id' || key === 'created_at' || key === 'updated_at') {
                  return null;
                }
                
                return (
                  <div key={key} className="character-stat">
                    <label className="stat-label">
                      {key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}:
                    </label>
                    <div className="stat-value">
                      {editingItemId === character.id ? (
                        <input
                          type="text"
                          value={value || ''}
                          onChange={(e) => handleFieldUpdate(character.id, key, e.target.value)}
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

            <div className="character-actions">
              {/* Edit and Delete buttons removed from individual character detail page */}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CharacterDetail

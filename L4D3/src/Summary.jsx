import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import './Cards.css'

function Summary() {
  const navigate = useNavigate()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingItemId, setEditingItemId] = useState(null)

  useEffect(() => {
    fetchDataOrderedByTime()
  }, [])

  async function fetchDataOrderedByTime() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('L4D3DB')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      setData(data || [])
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  function goBackToMain() {
    navigate('/')
  }

  function goToCharacterDetail(characterId) {
    navigate(`/character/${characterId}`)
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
        </a>
        <h1 className="summary-title">Character Summary</h1>
      </div>

      <div className="summary-container">
        <button 
          className="back-button"
          onClick={goBackToMain}
        >
          ← Back to Main
        </button>

        <div className="summary-list">
          {data.map((item, index) => (
            <div key={item.id || index} className="summary-item">
              <div 
                className="summary-clickable-area"
                onClick={() => goToCharacterDetail(item.id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="summary-header">
                  <h3 className="summary-item-title">
                    {editingItemId === item.id ? (
                      <input
                        type="text"
                        value={item.name || item.title || `Entry #${item.id || index + 1}`}
                        onChange={(e) => handleFieldUpdate(item.id, 'name', e.target.value)}
                        className="edit-input-title"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      item.name || item.title || `Entry #${item.id || index + 1}`
                    )}
                  </h3>
                </div>
                
                <div className="summary-content">
                  {Object.entries(item).map(([key, value]) => {
                    if (key === 'id' || key === 'created_at' || key === 'updated_at') {
                      return null;
                    }
                    
                    return (
                      <div key={key} className="summary-field">
                        <span className="summary-label">
                          {key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}:
                        </span>
                        <span className="summary-value">
                          {editingItemId === item.id ? (
                            <input
                              type="text"
                              value={value || ''}
                              onChange={(e) => handleFieldUpdate(item.id, key, e.target.value)}
                              className="edit-input"
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            value || 'No data'
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="card-actions">
                {editingItemId === item.id ? (
                  <button 
                    className="card-button card-button-primary"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleStopEdit()
                    }}
                  >
                    Done
                  </button>
                ) : (
                  <button 
                    className="card-button card-button-primary"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEdit(item.id)
                    }}
                  >
                    Edit
                  </button>
                )}
                <button 
                  className="card-button card-button-danger"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(item.id)
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Summary

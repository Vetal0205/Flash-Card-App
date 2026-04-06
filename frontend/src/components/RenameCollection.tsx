import { useState } from 'react';

interface Props {
  currentName: string;
  onSave: (newName: string) => void;
  onCancel: () => void;
}

function RenameCollection({ currentName, onSave, onCancel }: Props) {
  const [newName, setNewName] = useState(currentName);
  const [error, setError] = useState('');

  const handleSave = () => {
    if (newName.trim() === '') {
      setError('Incomplete Field.');
      return;
    }
    if (!/^[a-zA-Z0-9\s]+$/.test(newName)) {
      setError('Invalid Collection Name.');
      return;
    }
    onSave(newName);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3 style={styles.title}>Rename Collection</h3>

        <label style={styles.label}>COLLECTION NAME</label>
        <input
          style={styles.input}
          type="text"
          value={newName}
          onChange={(e) => {
            setNewName(e.target.value);
            setError('');
          }}
        />

        {error && <p style={styles.error}>{error}</p>}

        <div style={styles.buttons}>
          <button style={styles.saveButton} onClick={handleSave}>Save</button>
          <button style={styles.cancelButton} onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#ffffff',
    padding: '40px',
    borderRadius: '10px',
    width: '350px',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  title: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#333',
  },
  label: {
    fontSize: '11px',
    fontWeight: 'bold',
    color: '#555',
    marginBottom: '5px',
  },
  input: {
    padding: '10px',
    marginBottom: '10px',
    borderRadius: '5px',
    border: '1px solid #155a3e',
    fontSize: '14px',
  },
  error: {
    color: 'red',
    fontSize: '12px',
    marginBottom: '10px',
  },
  buttons: {
    display: 'flex',
    gap: '10px',
    marginTop: '10px',
  },
  saveButton: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#6b8f71',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  cancelButton: {
    flex: 1,
    padding: '10px',
    backgroundColor: 'white',
    border: '1px solid #ccc',
    borderRadius: '5px',
    fontSize: '14px',
    cursor: 'pointer',
    color: '#333',
  },
};

export default RenameCollection;
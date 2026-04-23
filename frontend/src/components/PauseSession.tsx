//Halema Diab
//Code for UC9- Pause study session
//maps to FR-19, FR-28, NFR-05, NFR-06
//A component that shows up when a user pauses a session with thier progress and different options on where ot be redirected





interface Props {
 deckName: string;
 currentCard: number;
 totalCards: number;
 onResume: () => void;
 onDashboard: () => void;
 errorMessage?: string | null;
}


function PauseSession({ deckName, currentCard, totalCards, onResume, onDashboard, errorMessage }: Props) {
 return (
   <div style={styles.overlay}>
     <div style={styles.modal}>
       <h2 style={styles.title}>Study session paused</h2>


       <div style={styles.card}>
         <p style={errorMessage ? styles.errorText : styles.savedText}>{errorMessage || "Your progress has been saved"}</p>
         <p style={styles.detail}>Deck: {deckName}</p>
         <p style={styles.detail}>Progress: {currentCard}/{totalCards} cards</p>


         <div style={styles.buttons}>
           <button style={styles.dashboardButton} onClick={onDashboard}>
             Return to Dashboard
           </button>
           <button style={styles.resumeButton} onClick={onResume}>
             Resume Session
           </button>
         </div>
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
   backgroundColor: '#f5f0eb',
   padding: '40px',
   borderRadius: '10px',
   width: '400px',
   display: 'flex',
   flexDirection: 'column' as const,
   alignItems: 'center',
 },
 title: {
   fontSize: '22px',
   fontWeight: 'bold',
   color: '#333',
   marginBottom: '20px',
 },
 card: {
   backgroundColor: '#ffffff',
   padding: '30px',
   borderRadius: '10px',
   width: '100%',
   display: 'flex',
   flexDirection: 'column' as const,
   alignItems: 'center',
 },
 savedText: {
   fontSize: '16px',
   color: '#333',
   marginBottom: '10px',
   fontWeight: 'bold' as const,
 },
 errorText: {
   fontSize: '16px',
   color: '#e74c3c',
   marginBottom: '10px',
   fontWeight: 'bold' as const,
 },
 detail: {
   fontSize: '14px',
   color: '#555',
   marginBottom: '5px',
 },
 buttons: {
   display: 'flex',
   gap: '10px',
   marginTop: '20px',
 },
 dashboardButton: {
   padding: '10px 15px',
   backgroundColor: 'white',
   border: '1px solid #ccc',
   borderRadius: '5px',
   fontSize: '13px',
   cursor: 'pointer',
   color: '#333',
 },
 resumeButton: {
   padding: '10px 15px',
   backgroundColor: '#6b8f71',
   color: 'white',
   border: 'none',
   borderRadius: '5px',
   fontSize: '13px',
   cursor: 'pointer',
 },
};


export default PauseSession;


import { useEffect, useRef, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { toast } from 'react-toastify';
import { baseURL } from '../utils/axiosInstance';
type Expense = {
  _id?: string;
  type: string;
  description: string;
  amount: number;
  proofImage?: string;
};

const Expense = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [refreshExpenses, setRefreshExpenses] = useState<boolean>(false);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const type = "expense";

  const syncExpenses = () => {
    axiosInstance
      .get("/get-today-transactions")
      .then((response) => {
        setExpenses(response.data.transactions);
      })
      .catch((error) => {
        console.error('Error fetching expenses:', error);
      });
  };

  useEffect(() => {
    syncExpenses();
  }, [refreshExpenses]);

  // const handleAddExpense = () => {
  //   if (description.trim() === '' || amount === '' || amount <= 0) {
  //     alert('Please enter a valid description and amount!');
  //     return;
  //   }
  //   if (!capturedImage) {
  //     alert("No image captured");
  //     return;
  //   }

  //   const newExpense: Expense = {
  //     type,
  //     description,
  //     amount: Number(amount),
  //   };

  //   axiosInstance
  //     .post("/create-transaction", newExpense)
  //     .then(() => {
  //       toast.success("Expense added successfully");
  //       setRefreshExpenses((prev) => !prev);
  //     })
  //     .catch((error) => {
  //       toast.error(error.response?.data?.message || "An error occurred");
  //     });

  //   setDescription('');
  //   setAmount('');
  // };
  const handleAddExpense = () => {
    if (description.trim() === '' || amount === '' || amount <= 0) {
      alert('Please enter a valid description and amount!');
      return;
    }
    if (capturedImage) {
      
    
    // Create a FormData object to send data and the image file
    const formData = new FormData();
    formData.append('type', type);
    formData.append('description', description);
    formData.append('amount', String(amount));
  
    // Convert the captured image (base64) to a Blob and append it
    const byteString = atob(capturedImage.split(',')[1]);
    const mimeString = capturedImage.split(',')[0].split(':')[1].split(';')[0];
    const arrayBuffer = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
      arrayBuffer[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([arrayBuffer], { type: mimeString });
    formData.append('proofImage', blob, 'expense-proof.png');
    console.log(blob)
  
    axiosInstance
      .post("/create-transaction", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then(() => {
        toast.success("Expense added successfully");
        setRefreshExpenses((prev) => !prev);
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || "An error occurred");
        console.log(error)
      });
  
    setDescription('');
    setAmount('');
    setCapturedImage(null);
    }else{
      const newExpense: Expense = {
            type,
            description,
            amount: Number(amount),
          };
      
          axiosInstance
            .post("/create-transaction", newExpense)
            .then(() => {
              toast.success("Expense added successfully");
              setRefreshExpenses((prev) => !prev);
            })
            .catch((error) => {
              toast.error(error.response?.data?.message || "An error occurred");
            });
      
          setDescription('');
          setAmount('');
    }
  };
  

  const handleDeleteExpense = (id: string) => {
    axiosInstance
      .delete(`/delete-transaction/${id}`)
      .then(() => {
        toast.success("Expense deleted successfully");
        setRefreshExpenses((prev) => !prev);
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || "An error occurred");
      });
  };

  const handleUploadImage = () => {
    setShowCamera(true);
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      })
      .catch((err) => {
        console.error("Error accessing webcam:", err);
      });
  };

  const handleCaptureImage = () => {
    if (canvasRef.current && videoRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        const imageData = canvasRef.current.toDataURL('image/png');
        setCapturedImage(imageData);
        setShowCamera(false);
        if (videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach((track) => track.stop());
        }
      }
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Today's Expenses</h2>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ flex: 2, marginRight: '10px', padding: '10px' }}
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value !== '' ? Number(e.target.value) : '')}
          style={{ flex: 1, marginRight: '10px', padding: '10px' }}
        />
        <button
          onClick={handleUploadImage}
          style={{
            padding: '10px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Upload Image
        </button>
        <button
          onClick={handleAddExpense}
          style={{
            padding: '10px',
            marginLeft: '10px',
            backgroundColor: 'green',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Add
        </button>
      </div>

      {showCamera && (
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <video ref={videoRef} style={{ width: '100%', marginBottom: '10px' }}></video>
          <button onClick={handleCaptureImage} style={{ padding: '10px', backgroundColor: '#007bff', color: '#fff', border: 'none', cursor: 'pointer' }}>
            Capture
          </button>
        </div>
      )}

      {capturedImage && (
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <img src={capturedImage} alt="Captured" style={{ width: '100%' }} />
        </div>
      )}
      <canvas ref={canvasRef} width={1280} height={720} style={{ display: 'none' }}></canvas>


      <ul style={{ listStyle: 'none', padding: 0 }}>
        {expenses.map((expense) => (
          <li
            key={expense._id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
          >
            <span style={{ flex: 2 }}>{expense.description}</span>
            {
              expense.proofImage &&
            <span style={{ flex: 2 }}><a href={`${baseURL}/uploads/${expense.proofImage}`} target="_blank" rel="noopener noreferrer">
                              View Image
                            </a></span>
            }
            <span style={{ flex: 1, textAlign: 'right' }}>Rs. {expense.amount}</span>
            <button
              onClick={() => handleDeleteExpense(expense._id!)}
              style={{
                padding: '5px 10px',
                backgroundColor: '#dc3545',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                marginLeft: '10px',
              }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Expense;

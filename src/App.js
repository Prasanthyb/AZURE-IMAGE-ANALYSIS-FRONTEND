

//~~~~~~~~~~~~~~~~~~~~~ Import necessary modules and components

import React, { useState } from 'react';
import axios from 'axios';
import { ThumbsUp } from 'phosphor-react';
import Navbar from './Navbar';

//~~~~~~~~~~~~~~~~~~~ Get API key and Azure endpoint from environment variables

const ApiKey = process.env.REACT_APP_API_KEY;
const AzureEndpoint = process.env.REACT_APP_AZURE_ENDPOINT;

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Main component function

function App() {

  //~~~~~~~~~~~~~~~~~~~~~ State variables

  const [data, setData] = useState(); // For storing data from Azure API
  const [image, setImage] = useState(''); // For storing the entered image URL
  const [displayMsg, setDisplayMsg] = useState(' '); // For displaying messages to the user
  const [parsedData, setParsedData] = useState(); // For storing parsed data from Azure API
  const [similarCarsData, setSimilarCarsData] = useState(null); // For storing similar cars data
  const [wishlist, setWishlist] = useState([]); // For storing wishlist items

  //~~~~~~~~~~~~~~~~~~~~~~ Function to add a car to the wishlist

  const addToWishlist = (car) => {
    setWishlist((prevWishlist) => [...prevWishlist, car]);
  };

  //`~~~~~~~~~~~~~~~~~~~~~~ Event handler for input change`

  const handleOnChange = (e) => {
    setImage(e.target.value);
  };

  //~~~~~~~~~~~~~~~~~~~ Event handler for button click to analyze the image

  const onButtonClick = async (e) => {

    //~~~~~~~~~~~~~~~~~~~~~ Validate image URL

    if (image.trim() === '') {
      alert('Please enter an image URL.');
    } else {
      setData();
      setDisplayMsg('Loading...');
    }

    if (
      !image ||
      !(
        image.endsWith('.jpg') ||
        image.endsWith('.jpeg') ||
        image.endsWith('.png') ||
        image.endsWith('.webp')
      )
    ) {
      setImage('');
      setDisplayMsg('Invalid image format or URL');
    } else {
      try {

        //~~~~~~~~~~~~~~~ Make a POST request to Azure Computer Vision API

        const fetchOptions = {
          method: 'POST',
          timeout: 50000,
          headers: {
            'Ocp-Apim-Subscription-Key': ApiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: image,
          }),
        };

        const response = await fetch(
          `${AzureEndpoint}computervision/imageanalysis:analyze?api-version=2023-02-01-preview&features=tags,caption`,
          fetchOptions,
        );

        //~~~~~~~~~~~~~~ Parse the response data

        const parsedData = await response.json();
        console.log(parsedData);
        setData(parsedData);
        setParsedData(parsedData);

        console.log(parsedData.modelVersion);
        console.log(parsedData.captionResult.text);
        console.log(parsedData.metadata.width);
        console.log(parsedData.metadata.height);

      } catch (error) {
        console.error('There is an error during fetch:', error);
        setDisplayMsg('Sorry, there was an error.', error);
      }
    }
  };

  //~~~~~~~~~~~~~~~~~` Function to get similar cars from the server

  const getSimilarCars = () => {
    const sentence = parsedData.captionResult.text;
    const words = sentence.split(' ');
    const secondWord = words[1];

    axios.post('http://localhost:4000/cars/getcars', { data: secondWord }).then((response) => {
      console.log(response.data);
      setSimilarCarsData(response.data);
    });
  };

  //~~~~~~~~~~~~~~~~~~~~~~~~~~ JSX for rendering the component`

  return (

    <div>
      <Navbar />

      <div className="container">

        {/*~~~~~~~~~~~~~~~~~~~~~ Header Section */}

        <div>
          <div className="header">
            <h1 style={{ backgroundColor: 'red', fontSize: '48px', color: 'black', padding: '8px', display: 'block' }}>
              Welcome to Turners Car Auctions
            </h1>
            <h3
              style={{
                backgroundColor: 'lightgreen',
                fontSize: '18px',
                color: 'blue',
                fontStyle: 'italic',
                padding: '8px',
                display: 'block',
              }}
            >
              Don't Dream It, Drive It!
            </h3>
          </div>
        </div>

        {/*~~~~~~~~~~~~~~~~~~~~~ Input Section */}

        <div>
          <div className="input-section">
            <label
              htmlFor="imageInput"
              style={{
                backgroundColor: 'orange',
                fontSize: '18px',
                color: 'black',
                padding: '8px',
                display: 'block',
              }}
            >
              Enter the image URL of your favorite car
            </label>

            <input
              id="imageInput"
              className="inputbox"
              placeholder="Please enter the image URL...."
              value={image}
              onChange={handleOnChange}
              style={{
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #ccc',
                boxShadow: '0 0 5px rgba(0, 0, 0, 0.1)',
                fontSize: '16px',
                outline: 'none',
              }}
            />
            <button className="button" onClick={onButtonClick}>
              Click Here
            </button>
          </div>
        </div>

        {/*~~~~~~~~~~~~~~~~~~~~~ Result Section */}

        <section className="result-section">
          {image && <img src={image} width={320} height={180} alt={image} />}
          <p className="textclass">{data && data.captionResult.text}</p>

          {data &&
          data.tagsResult &&
          data.tagsResult.values.some((item) => item.name === 'car') ? (
            <ul>
              {data.tagsResult.values.map((item) => (
                <li key={item.name}>
                  <span>
                    {item.name} - Confidence level {parseInt(item.confidence * 100)}%
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div>{displayMsg && <p>{displayMsg}</p>}</div>
          )}
        </section>

        {/* Button to Get Similar Cars */}

        <button onClick={getSimilarCars}>Get Similar Cars from Turners</button>

        {/*~~~~~~~~~~~~~~~~~~~~~ Section to Display Similar Cars */}

        {similarCarsData && (
          <div className="similar-cars-section">
            <h2>Similar Cars from Turners</h2>
            <ul>
              {similarCarsData.map((car) => (
                <li key={car.id}>
                  <img src={car.image} alt={car.name} width={100} height={80} />
                  <p>Name: {car.name}</p>
                  <p>Color: {car.color}</p>
                  <p>Amount: ${car.amount}</p>
                  <button onClick={() => addToWishlist(car)}>Add to Wishlist</button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/*~~~~~~~~~~~~~~~~~~~~~Wishlist Section */}

        <div className="wishlist-section" style={{ backgroundColor: 'lightgreen' }}>
          <h2 style={{ color: 'red' }}>
            <ThumbsUp size={32} />
            Wishlist{' '}
          </h2>
          <ul>
            {wishlist.map((wishlistItem, index) => (
              <li key={index}>
                <img src={wishlistItem.image} alt={wishlistItem.name} width={100} height={80} />
                <p>Name: {wishlistItem.name}</p>
                <p>Color: {wishlistItem.color}</p>
                <p>Amount: ${wishlistItem.amount}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ~~~~~~~~~~~~~~~~~~~~~Export the component

export default App;

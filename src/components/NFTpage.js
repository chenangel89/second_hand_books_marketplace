import Navbar from "./Navbar";
import { ethers } from "ethers";
import React from "react";
import axie from "../tile.jpeg";
import { useLocation, useParams } from 'react-router-dom';
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { useState } from "react";
import { GetIpfsUrlFromPinata } from "../utils";

export default function NFTPage (props) {

const [data, updateData] = useState({});
const [dataFetched, updateDataFetched] = useState(false);
const [message, updateMessage] = useState("");
const [currAddress, updateCurrAddress] = useState("0x");

async function getNFTData(tokenId) {
    const ethers = require("ethers");
    //After adding your Hardhat network to your metamask, this code will get providers and signers
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const addr = await signer.getAddress();
    //Pull the deployed contract instance
    let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer)
    //create an NFT Token
    var tokenURI = await contract.tokenURI(tokenId);
    const listedToken = await contract.getListedTokenForId(tokenId);
    tokenURI = GetIpfsUrlFromPinata(tokenURI);
    let meta = await axios.get(tokenURI);
    meta = meta.data;
    console.log(listedToken);

    let item = {
        price: meta.price,
        tokenId: tokenId,
        seller: listedToken.seller,
        owner: listedToken.owner,
        image: meta.image,
        name: meta.name,
        description: meta.description,
        author: meta.author,
        contact_name: meta.contact_name,
        contact_email: meta.contact_email,
        contact_phone: meta.contact_phone,
        trading_site: meta.trading_site,
        ebook: meta.ebook
    }

    console.log(item);
    updateData(item);
    updateDataFetched(true);
    console.log("address", addr)
    updateCurrAddress(addr);
}

// async function handleBurnNFT(tokenId) {
//     try {
//         const ethers = require("ethers");
//         const provider = new ethers.providers.Web3Provider(window.ethereum);
//         const signer = provider.getSigner();

//         //Pull the deployed contract instance
//         let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);
//         updateMessage("Burning the NFT... Please Wait (Upto 5 mins)")

//         const transaction = await contract.burnNFT(tokenId);
//         await transaction.wait();

//         // Handle successful burn
//         alert("NFT burned successfully");
//     } catch (error) {
//         // Handle error
//         alert("Error burning NFT");
//     }
// };

async function buyNFT(tokenId) {
    try {
        const ethers = require("ethers");
        //After adding your Hardhat network to your metamask, this code will get providers and signers
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        //Pull the deployed contract instance
        let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);
        const salePrice = ethers.utils.parseUnits(data.price, 'ether')
        updateMessage("Buying the NFT... Please Wait (Upto 5 mins)")
        //run the executeSale function
        let transaction = await contract.executeSale(tokenId, {value:salePrice});
        await transaction.wait();

        alert('You successfully bought the NFT!');
        updateMessage("");
    }
    catch(e) {
        alert("Upload Error"+e)
    }
}

    const params = useParams();
    const tokenId = params.tokenId;
    if(!dataFetched)
        getNFTData(tokenId);
    if(typeof data.image == "string")
        data.image = GetIpfsUrlFromPinata(data.image);
    if(typeof data.ebook == "string")
        data.ebook = GetIpfsUrlFromPinata(data.ebook);

    return(
        <div style={{"min-height":"100vh"}}>
            <Navbar></Navbar>
            <div className="flex ml-20 mt-20 mb-20">
                <img src={data.image} alt="" className="mt-7 w-2/5 h-2/5" />
                <div className="text-x1 ml-20 space-y-1 text-black shadow-2xl rounded-lg border-2 p-5">
                    {/* <button className="bg-red-500 text-white px-4 py-2 mt-3 rounded-sm" onClick={() => handleBurnNFT(tokenId)}>
                        Burn
                    </button> */}
                    <div>
                        Name: {data.name}
                    </div>
                    <div>
                        Author: {data.author}
                    </div>
                    <div>
                        Description: {data.description}
                    </div>
                    <div>
                        Price: <span className="">{data.price + " ETH"}</span>
                    </div>
                    <div>
                        Owner: <span className="text-sm">{data.owner}</span>
                    </div>
                    <div>
                        Seller: <span className="text-sm">{data.seller}</span>
                    </div>
                    <div>
                        Contact Name: {data.contact_name}
                    </div>
                    <div>
                        Contact E-mail: {data.contact_email}
                    </div>
                    <div>
                        Contact Phone: {data.contact_phone}
                    </div>
                    <div>
                        Other Trading Site: <a className= "text-blue-600/100" href={data.trading_site} target="_blank" rel="noopener noreferrer">{data.trading_site}</a>
                    </div>
                    { currAddress != data.owner && currAddress !== data.seller ?
                        <div></div>
                        : <div><a className= "text-blue-600/100" href={data.ebook} target="_blank" rel="noopener noreferrer">View Ebook</a></div>
                    }
                    <br></br>
                    <div>
                    { currAddress !== data.owner && currAddress !== data.seller ?
                        <button className="enableEthereumButton bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded text-sm" onClick={() => buyNFT(tokenId)}>Buy this NFT</button>
                        : <div className="text-purple-500">You are the owner of this NFT</div>
                    }
                    
                    <div className="text-green text-center mt-3">{message}</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

import Navbar from "./Navbar";
import { useState } from "react";
import { uploadFileToIPFS, uploadJSONToIPFS } from "../pinata";
import Marketplace from '../Marketplace.json';
import { useLocation } from "react-router";

export default function SellNFT() {
    const [formParams, updateFormParams] = useState({ name: '', description: '', price: '', author: '', contact_name: '', contact_email: '', contact_phone: '', trading_site: '' });
    const [fileURL, setFileURL] = useState(null);
    const [ebookURL, setEbookURL] = useState(null);
    const ethers = require("ethers");
    const [message, updateMessage] = useState('');
    const location = useLocation();

    async function disableButton() {
        const listButton = document.getElementById("list-button")
        listButton.disabled = true
        listButton.style.backgroundColor = "grey";
        listButton.style.opacity = 0.3;
    }

    async function enableButton() {
        const listButton = document.getElementById("list-button")
        listButton.disabled = false
        listButton.style.backgroundColor = "#A500FF";
        listButton.style.opacity = 1;
    }

    //This function uploads the NFT image to IPFS
    async function OnChangeFile(e, fileType) {
        var file = e.target.files[0];
        // check for file extension
        try {
            // upload the file to IPFS
            disableButton();
            updateMessage(`Uploading ${fileType}... Please don't click anything!`);
            const response = await uploadFileToIPFS(file);
            if (response.success === true) {
                enableButton();
                updateMessage("");
                console.log(`Uploaded ${fileType} to Pinata: `, response.pinataURL);
                if (fileType === 'image') {
                    setFileURL(response.pinataURL);
                } else if (fileType === 'ebook') {
                    setEbookURL(response.pinataURL);
                }
            }
        } catch (e) {
            console.log(`Error during ${fileType} upload`, e);
        }
    }
    

    //This function uploads the metadata to IPFS
    async function uploadMetadataToIPFS() {
        const {name, author, description, price, contact_name, contact_email, contact_phone, trading_site} = formParams;
        //Make sure that none of the fields are empty
        if( !name || !description || !price || !fileURL || !author)
        {
            updateMessage("Please fill all the fields!")
            return -1;
        }

        const nftJSON = {
            name,
            image: fileURL,
            author,
            description,
            price,
            ebook: ebookURL,
            contact_name,
            contact_email,
            contact_phone,
            trading_site
        }

        try {
            //upload the metadata JSON to IPFS
            const response = await uploadJSONToIPFS(nftJSON);
            if(response.success === true){
                console.log("Uploaded JSON to Pinata: ", response)
                return response.pinataURL;
            }
        }
        catch(e) {
            console.log("error uploading JSON metadata:", e)
        }
    }

    async function listNFT(e) {
        e.preventDefault();

        //Upload data to IPFS
        try {
            const metadataURL = await uploadMetadataToIPFS();
            if(metadataURL === -1)
                return;
            //After adding your Hardhat network to your metamask, this code will get providers and signers
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            disableButton();
            updateMessage("Please wait ... Uploading NFT(upto 5 mins)");

            //Pull the deployed contract instance
            let contract = new ethers.Contract(Marketplace.address, Marketplace.abi, signer)

            //massage the params to be sent to the create NFT request
            const price = ethers.utils.parseUnits(formParams.price, 'ether')
            let listingPrice = await contract.getListPrice()
            listingPrice = listingPrice.toString()

            //actually create the NFT
            let transaction = await contract.createToken(metadataURL, price, { value: listingPrice })
            await transaction.wait()

            alert("Successfully listed your NFT!");
            enableButton();
            updateMessage("");
            updateFormParams({ name: '', description: '', price: '', contact_name: '', contact_email: '', contact_phone: '', trading_site: ''});
            window.location.replace("/")
        }
        catch(e) {
            alert( "Upload error"+e )
        }
    }

    console.log("Working", process.env);
    return (
        <div className="">
        <Navbar></Navbar>
        <div className="flex flex-col place-items-center mt-10" id="nftForm">
            <form className="bg-white shadow-md rounded px-20 pt-4 pb-10 mb-20">
            <h3 className="text-center font-bold text-orange-500 mb-8">Upload your book to the marketplace</h3>
                <div className="mb-4">
                    <label className="block text-orange-500 text-sm font-bold mb-2" htmlFor="name">Name</label>
                    <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="name" type="text" placeholder="Little Red Riding Hood" onChange={e => updateFormParams({...formParams, name: e.target.value})} value={formParams.name}></input>
                </div>
                <div>
                    <label className="block text-orange-500 text-sm font-bold mb-2" htmlFor="image">Upload Book Cover (&lt;500 KB)</label>
                    <input type="file" onChange={(e) => OnChangeFile(e, 'image')}></input>
                </div>
                <br></br>
                <div className="mb-4">
                    <label className="block text-orange-500 text-sm font-bold mb-2" htmlFor="author">Author</label>
                    <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="author" type="text" placeholder="Lari Don" onChange={e => updateFormParams({...formParams, author: e.target.value})} value={formParams.author}></input>
                </div>
                <div className="mb-6">
                    <label className="block text-orange-500 text-sm font-bold mb-2" htmlFor="description">Description</label>
                    <textarea className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" cols="40" rows="5" id="description" type="text" placeholder="Scottish storyteller Lari Don's retelling of this well-loved tale is lively and exciting with a wolf who is just scary enough for younger children to enjoy." value={formParams.description} onChange={e => updateFormParams({...formParams, description: e.target.value})}></textarea>
                </div>
                <div className="mb-6">
                    <label className="block text-orange-500 text-sm font-bold mb-2" htmlFor="price">Price</label>
                    <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="number" placeholder="Min 0.01 ETH" step="0.01" value={formParams.price} onChange={e => updateFormParams({...formParams, price: e.target.value})}></input>
                </div>
                <div>
                    <label className="block text-orange-500 text-sm font-bold mb-2" htmlFor="ebook">Upload EBook File (&lt;500 KB)</label>
                    <input type="file" onChange={(e) => OnChangeFile(e, 'ebook')}></input>
                </div>
                <br></br>
                <div className="mb-4">
                    <label className="block text-orange-500 text-sm font-bold mb-2" htmlFor="contact_name">Contact Name</label>
                    <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="contact_name" type="text" placeholder="Chen Angel" onChange={e => updateFormParams({...formParams, contact_name: e.target.value})} value={formParams.contact_name}></input>
                </div>
                <div className="mb-4">
                    <label className="block text-orange-500 text-sm font-bold mb-2" htmlFor="contact_email">Contact Email</label>
                    <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="contact_email" type="text" placeholder="example@gmail.com" onChange={e => updateFormParams({...formParams, contact_email: e.target.value})} value={formParams.contact_email}></input>
                </div>
                <div className="mb-4">
                    <label className="block text-orange-500 text-sm font-bold mb-2" htmlFor="contact_phone">Contact Phone</label>
                    <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="contact_phone" type="text" placeholder="09XX-XXXX-XX" onChange={e => updateFormParams({...formParams, contact_phone: e.target.value})} value={formParams.contact_phone}></input>
                </div>
                <div className="mb-4">
                    <label className="block text-orange-500 text-sm font-bold mb-2" htmlFor="trading_site">Other Trading Site</label>
                    <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="trading_site" type="text" placeholder="shp.ee/quwxcgm" onChange={e => updateFormParams({...formParams, trading_site: e.target.value})} value={formParams.trading_site}></input>
                </div>
                <br></br>
                <div className="text-red-500 text-center">{message}</div>
                <button onClick={listNFT} className="font-bold mt-10 w-full bg-orange-500 text-white rounded p-2 shadow-lg" id="list-button">
                    Submit
                </button>
            </form>
        </div>
        </div>
    )
}

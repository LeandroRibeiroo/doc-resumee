import { useRef, useState } from "react";
import { IoCopy, IoTrash } from "react-icons/io5";
import axios from "axios";
import ReactMarkdown from "react-markdown";

function App() {
  const [pdfData, setPdfData] = useState<File | undefined>(undefined);
  const [pdfName, setPdfName] = useState<string>("");
  const [textResult, setTextResult] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const fileInputRef = useRef(null);

  const handleClear = () => {
    setPdfData(undefined);
    setPdfName("");
    setTextResult("");
  };

  const handleCopyToClipboard = () => {
    if (!pdfData || textResult === "") {
      return;
    }

    navigator.clipboard.writeText(textResult).then(
      () => {
        alert("Texto copiado!");
      },
      (err) => {
        console.error("Erro ao tentar copiar o texto: ", err);
        alert("Erro ao tentar copiar o texto.");
      }
    );
  };

  const handleSendRequest = async (formData: FormData) => {
    setIsProcessing(true);
    try {
      const response = await axios.post(
        "http://localhost:8000/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setTextResult(response.data.message);

      return;
    } catch (error) {
      return Promise.reject(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setPdfName(event.target.files?.[0].name ?? "");
    setPdfData(file);

    if (!file) {
      alert("Please select a PDF file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    handleSendRequest(formData);

    event.target.value = "";
  };

  return (
    <div className="h-screen bg-gray-800 flex flex-col overflow-hidden">
      <div className="flex flex-col sticky w-full h-1/6 p-4 items-center justify-center md:p-6">
        <h2 className="text-gray-200 pb-4"> Resumao do Luis </h2>
        <div
          className={`flex relative w-full h-9 rounded-lg bg-blue-600 overflow-hidden items-center justify-start px-4 hover:opacity-80 transition duration-0 hover:duration-300`}
        >
          <p className="text-white font-semibold overflow-ellipsis">
            {pdfName === "" ? "Insira o arquivo aqui" : pdfName}
          </p>
          <input
            type="file"
            accept="application/pdf"
            className="opacity-0 absolute w-full cursor-pointer"
            onChange={(event) => handleChange(event)}
            ref={fileInputRef}
          />
        </div>
      </div>
      <div className="flex-1 bg-gray-800 p-4 md:p-6">
        <div className="flex w-1/6 pb-6 items-center justify-between md:w-[5%]">
          <div
            onClick={handleCopyToClipboard}
            className={`bg-white text-gray-700 flex items-center justify-center w-6 h-6 rounded-full ${
              textResult !== "" ? "cursor-pointer" : "cursor-not-allowed"
            } hover:opacity-80 transition duration-0 hover:duration-300`}
          >
            <IoCopy />
          </div>
          <div
            onClick={handleClear}
            className={`bg-white text-red-700 flex items-center justify-center w-6 h-6 rounded-full ${
              textResult !== "" ? "cursor-pointer" : "cursor-not-allowed"
            } hover:opacity-80 transition duration-0 hover:duration-300`}
          >
            <IoTrash />
          </div>
        </div>
        <div
          className={`flex flex-col w-full h-5/6 bg-white overflow-y-auto rounded-lg p-4 md:p-6 ${
            !isProcessing || textResult === ""
              ? "items-center justify-center"
              : "items-start justify-start"
          }`}
        >
          {!isProcessing && textResult === "" && (
            <h4> Aguardando selecao de arquivo... </h4>
          )}

          {isProcessing && (
            <div role="status">
              <svg
                aria-hidden="true"
                className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"
                />
              </svg>
            </div>
          )}
          {textResult !== "" && <ReactMarkdown>{textResult}</ReactMarkdown>}
        </div>
      </div>
    </div>
  );
}

export default App;

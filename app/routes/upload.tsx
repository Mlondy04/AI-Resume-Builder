import { prepareInstructions } from "../../constants";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import FileUploader from "~/Components/FileUploader";
import Navbar from "~/Components/Navbar";
import { convertPdfToImage } from "~/lib/pdf2image";
import { usePuterStore } from "~/lib/puter";

const upload = () => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const {auth, isLoading, fs, ai, kv} = usePuterStore();
    const navigate = useNavigate();

    const handleFileSelect = (file: File | null) => {
        setFile(file);
    }

    const handleAnaylze = async ({companyName, jobTitle, jobDescription, file}: {companyName: string, jobTitle: string, jobDescription: string, file:File}) => {
        setIsProcessing(true);
        setStatusText('Uploading the file...');

        const uploadFile = await fs.upload([file]);
        if (!uploadFile) return setStatusText('Failed to upload the file.');

        setStatusText('Converting to image...');
        const imageFile = await convertPdfToImage(file);
        if (!imageFile.file) {
            return setStatusText('Failed to convert PDF to image.');
        }

        setStatusText('Uploading the image...');

        const uploadImage = await fs.upload([imageFile.file]);
        if (!imageFile.file) {
            console.error("PDF conversion error:", imageFile.error);
            return setStatusText(`Failed to convert PDF to image: ${imageFile.error}`);
        }

        if (!uploadImage) return setStatusText('Failed to upload the image.');

        setStatusText('Preparing the data...');

        const uuid = crypto.randomUUID();

        const data =  {
            id: uuid,
            resumePath: uploadFile.path,
            imagePath: uploadImage.path,
            companyName,
            jobTitle,
            jobDescription,
            feedback: ''
        }

        await kv.set(`resume:${uuid}`, JSON.stringify(data));
        setStatusText('Analyzing the resume...');

        const feedback = await ai.feedback(
            uploadFile.path,
            prepareInstructions({jobTitle, jobDescription})
        )
        if (!feedback) return setStatusText('Failed to analyze the resume.');

        const feedbackText = typeof feedback.message.content === 'string' ? feedback.message.content : feedback.message.content[0].text;

        data.feedback = JSON.parse(feedbackText);

        await kv.set(`resume:${uuid}`, JSON.stringify(data));

        setStatusText('Analysis complete, redirecting...');
        navigate(`/resume/${uuid}`);
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget.closest('form');
        if (!form) return;
        const formData = new FormData(form);
        const companyName = formData.get('company-name') as string;
        const jobTitle = formData.get('job-title') as string;
        const jobDescription = formData.get('job-description') as string;

        if (!file) return;

        handleAnaylze({ companyName, jobTitle, jobDescription, file })
    }

    return (
        <main className="bg-[url('/assets/public/images/bg-main.svg')] bg-cover">
            <Navbar />
            <section className="main-section">
                <div className="page-heading py-16">
                    <h1>Smart feedback for your dream job</h1>
                    {isProcessing ? (
                        <>
                            <h2>{statusText}</h2>
                            <img src="/assets/public/images/resume-scan.gif" alt="Loading" className="w-full" />
                        </>
                    ):(
                        <h2>Upload your resume to get started</h2>
                    )}
                    {!isProcessing && (
                        <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
                            <div className="form-div">
                                <label htmlFor="company-name" className="form-label">Company Name</label>
                                <input type="text" id="company-name" name="company-name" className="form-input" placeholder="Enter company name" required />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-title" className="form-label">Job Title</label>
                                <input type="text" id="job-title" name="job-title" className="form-input" placeholder="Job Title" required />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-description" className="form-label">Job Description</label>
                                <textarea rows={5} name="job-description" placeholder="Job Description" />
                            </div>
                            <div className="form-div">
                                <label htmlFor="uploader">Upload Resume</label>
                                <FileUploader onFileSelect={handleFileSelect}/>
                            </div>
                            <button type="submit" className="primary-button">Analyze Resume</button>
                        </form>
                    )}
                </div>
            </section>
        </main>
    )
}

export default upload;
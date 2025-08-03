import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router"
import Summary from "~/Components/Summary";
import ATS from "~/Components/ATS";
import Details from "~/Components/Details";
import { usePuterStore } from "~/lib/puter";

export const meta = () => ([
    {title: 'Joben | Review'},
    {name: 'description', content: 'Detailed review of your resume with AI feedback and suggestions.'}
])
const resume = () => {
    const {auth, isLoading, fs, kv} = usePuterStore();
    const {id} = useParams();
    const [imageUrl, setImageUrl] = useState<string>('');
    const [resumeUrl, setResumeUrl] = useState<string>('');
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const navigate = useNavigate();

     useEffect(() => {
        if (!isLoading && !auth.isAuthenticated) navigate(`/auth?next=/resume/${id}`);
    }, [isLoading]);

    useEffect(() => {
        const loadResume = async () => {
            const resume = await kv.get(`resume:${id}`);
            
            if (!resume) return;

            const data = JSON.parse(resume);

            const resumeBlob = await fs.read(data.resumePath);

            if (!resumeBlob) return;

            const pdfBlob = new Blob([resumeBlob], { type: 'application/pdf' });
            const resumeUrl = URL.createObjectURL(pdfBlob);
            setResumeUrl(resumeUrl);

            const imageBlob = await fs.read(data.imagePath);
            if (!imageBlob) return;

            const imageUrl = URL.createObjectURL(imageBlob);
            setImageUrl(imageUrl);
            setFeedback(data.feedback);
            console.log({resumeUrl, imageUrl, feedback: data.feedback});
        }

        loadResume();
    }, [id]);

  return (
    <main className="!pt-0">
        <nav className="resume-nav">
            <Link to="/" className="back-button">
                <img src="/assets/public/icons/back.svg" alt="Back" className="w-2.5 h-2.5"/>
                <span className="text-gray-800 text-sm font-semibold">Back to Homepage</span>
            </Link>
        </nav>
        <div className="flex flex-row w-full max-lg:flex-col-reverse">
            <section className="feedback-section bg-[url('/assets/public/images/bg-small.svg')] bg-cover h-[100vh] sticky top-0 items-center justify-center">
                {imageUrl && resumeUrl && (
                    <div className="animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-[90%] max-wxl:h-fit w-fit">
                        <a href={resumeUrl} target="_blank" rel="noopener noreferrer" >
                            <img src={imageUrl} alt="Resume Preview" className="w-full h-full object-contain rounded-2xl" />
                        </a>
                    </div>
                )}
            </section>
            <section className="feedback-section">
                <h2 className="text-4xl !text-black font-bold mb-4">Resume Feedback</h2>
                {feedback ? (
                    <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
                       < Summary feedback={feedback}/>
                       <ATS score={feedback.ATS.score || 0} suggestions={feedback.ATS.tips}/>
                       <Details feedback={feedback}/>
                    </div>
                ): (
                    <img src="/assets/public/images/resume-scan-2.gif" alt="No feedback available" className="w-full h-full object-contain" />
                )}
            </section>
        </div>
    </main>
  )
}

export default resume

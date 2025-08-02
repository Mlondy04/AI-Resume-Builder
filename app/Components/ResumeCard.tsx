import { Link } from 'react-router'
import ScoreCircle from './ScoreCircle'

const ResumeCard = ({resume: {id, companyName, jobTitle, imagePath, feedback}}: {resume: Resume}) =>{
  return (
      <Link to={`/resume/${id}`} className='resume-card animate-in fade-in duration-100'>
        <div className="resume-card-header">
            <div className='flex flex-col gap-2'>
                <h2 className='!text-black font-bold break-words'>{companyName || "Company Name"}</h2>
                <h3 className='text-lg break-words text-gray-500'>{jobTitle || "Job Title"}</h3>
            </div>
            <div className='flex-shrink-0'>
                <ScoreCircle score={feedback.overallScore} />
            </div>
        </div>
        <div className='gradient-border animate-in fade-in duration-100'>
            <div className="w-full h-full">
                <img src={imagePath} alt={`${companyName} logo`} className='w-full h-[350px] max-sm:h-[200px] object-cover object-top' />
            </div>
        </div>
     </Link>
  )
}

export default ResumeCard

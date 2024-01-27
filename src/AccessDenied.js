import warningImg from './redTriangleWaring.png';

export const AccessDenied = () =>{
    

    return(

        <div className="flex h-screen items-center justify-center">
            <h2 className="font-bold inline-flex">
                <img src={warningImg} alt="" height={20} width={20}/>
                Whoops! You need an Admin to access this page.
                <img src={warningImg} alt="" height={20} width={20}/>
            </h2>
        </div>
    )
}
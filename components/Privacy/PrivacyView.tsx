
import React from 'react';

const PrivacyView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-8 lg:p-12 overflow-y-auto h-full custom-scrollbar animate-in fade-in duration-500">
      <div className="bg-slate-900/50 rounded-3xl border border-slate-800 p-8 lg:p-12 space-y-12">
        
        {/* Korean Section */}
        <section className="space-y-6">
          <h1 className="text-3xl font-bold text-white border-b border-slate-800 pb-4">개인정보처리방침</h1>
          
          <div className="space-y-4 text-slate-300 leading-relaxed">
            <p>StudyStream Pro는 사용자의 개인정보를 소중하게 생각합니다. 본 방침은 당사 앱에서 수집되는 정보의 종류와 사용 방법을 설명합니다.</p>
            
            <h2 className="text-xl font-bold text-blue-400">1. 로그 파일</h2>
            <p>StudyStream Pro는 표준 로그 파일을 사용합니다. 이 파일은 방문자가 앱을 사용할 때 발생하는 정보를 기록하며, 여기에는 IP 주소, 브라우저 유형, 인터넷 서비스 제공업체(ISP), 날짜/시간 스탬프, 참조/종료 페이지 등이 포함될 수 있습니다. 이 정보는 트렌드 분석, 사이트 관리 및 사용자 이동 추적을 위해 사용됩니다.</p>
            
            <h2 className="text-xl font-bold text-blue-400">2. 쿠키 및 웹 비콘</h2>
            <p>여타 웹사이트와 마찬가지로, 당사는 '쿠키'를 사용합니다. 쿠키는 방문자의 선호도 및 방문한 페이지 정보를 저장하여 사용자 경험을 최적화하는 데 사용됩니다.</p>
            
            <h2 className="text-xl font-bold text-blue-400">3. Google DoubleClick DART 쿠키</h2>
            <p>Google은 당사 앱의 타사 공급업체 중 하나입니다. Google은 DART 쿠키를 사용하여 사용자가 인터넷의 다른 사이트를 방문한 기록을 바탕으로 광고를 제공합니다. 사용자는 Google 광고 및 콘텐츠 네트워크 개인정보처리방침(https://policies.google.com/technologies/ads)을 방문하여 DART 쿠키 사용을 거부할 수 있습니다.</p>
            
            <h2 className="text-xl font-bold text-blue-400">4. 광고 파트너</h2>
            <p>당사 앱의 일부 광고주는 쿠키와 웹 비콘을 사용할 수 있습니다. 당사의 광고 파트너에는 Google AdSense가 포함됩니다. 각 광고 파트너는 사용자 데이터에 대한 자체 개인정보처리방침을 보유하고 있습니다.</p>
          </div>
        </section>

        <hr className="border-slate-800" />

        {/* English Section */}
        <section className="space-y-6">
          <h1 className="text-3xl font-bold text-white border-b border-slate-800 pb-4">Privacy Policy</h1>
          
          <div className="space-y-4 text-slate-300 leading-relaxed">
            <p>At StudyStream Pro, accessible from our web application, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by StudyStream Pro and how we use it.</p>
            
            <h2 className="text-xl font-bold text-emerald-400">Log Files</h2>
            <p>StudyStream Pro follows a standard procedure of using log files. These files log visitors when they use the app. The information collected by log files include internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable.</p>
            
            <h2 className="text-xl font-bold text-emerald-400">Cookies and Web Beacons</h2>
            <p>Like any other website, StudyStream Pro uses 'cookies'. These cookies are used to store information including visitors' preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users' experience by customizing our web page content based on visitors' browser type and/or other information.</p>
            
            <h2 className="text-xl font-bold text-emerald-400">Google DoubleClick DART Cookie</h2>
            <p>Google is one of a third-party vendor on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to other sites on the internet. However, visitors may choose to decline the use of DART cookies by visiting the Google ad and content network Privacy Policy at the following URL – https://policies.google.com/technologies/ads</p>
            
            <h2 className="text-xl font-bold text-emerald-400">Third Party Privacy Policies</h2>
            <p>StudyStream Pro's Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the respective Privacy Policies of these third-party ad servers for more detailed information. It may include their practices and instructions about how to opt-out of certain options.</p>
          </div>
        </section>

        <div className="pt-8 text-center text-slate-500 text-xs">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default PrivacyView;

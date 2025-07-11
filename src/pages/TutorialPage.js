// src/pages/TutorialPage.js
import React from 'react';
import './TutorialPage.css';

const TutorialPage = () => {
    return (
        <div className="tutorial-container container">
            <div className="section">
                <h2>১. G9Tool কী?</h2>
                <p>G9Tool একটি HTML-ভিত্তিক প্রোডাক্ট জেনারেটর টুল যা আপনাকে আপনার প্রোডাক্টের কোড তৈরি, প্রিভিউ, কপি, এবং সংরক্ষণ করার সুবিধা দেয়।</p>
            </div>
            <div className="section">
                <h2>২. কীভাবে প্রোডাক্ট কোড তৈরি করবেন?</h2>
                <p>Dashboard এ গিয়ে প্রোডাক্ট নাম, কোড, ছবি, মূল্য ইত্যাদি তথ্য দিন এবং "Generate" বাটনে ক্লিক করুন।</p>
            </div>
            <div className="section">
                <h2>৩. Admin Panel</h2>
                <p>এখানে আপনি আপনার সংরক্ষিত প্রোডাক্টগুলো দেখতে পাবেন এবং সেগুলো Edit অথবা Delete করতে পারবেন।</p>
            </div>
        </div>
    );
};
export default TutorialPage;

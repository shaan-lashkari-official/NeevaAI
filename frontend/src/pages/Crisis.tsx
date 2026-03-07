import { Phone, MessageSquare, AlertTriangle } from 'lucide-react';

const Crisis = () => {
    const resources = [
        {
            name: '988 Suicide & Crisis Lifeline',
            description: '24/7 free and confidential support',
            phone: '988',
            text: 'Text 988',
            gradient: 'from-red-500 to-orange-500',
        },
        {
            name: 'Crisis Text Line',
            description: 'Free, 24/7 support for those in crisis',
            text: 'Text HOME to 741741',
            gradient: 'from-orange-500 to-amber-500',
        },
        {
            name: 'National Domestic Violence Hotline',
            description: 'Support for domestic violence survivors',
            phone: '1-800-799-7233',
            text: 'Text START to 88788',
            gradient: 'from-purple-500 to-pink-500',
        },
        {
            name: 'SAMHSA National Helpline',
            description: 'Treatment referral and information',
            phone: '1-800-662-4357',
            gradient: 'from-blue-500 to-cyan-500',
        },
        {
            name: 'The Trevor Project',
            description: 'Crisis intervention for LGBTQ+ youth',
            phone: '1-866-488-7386',
            text: 'Text START to 678678',
            gradient: 'from-pink-500 to-rose-500',
        },
        {
            name: 'Veterans Crisis Line',
            description: 'Support for veterans and families',
            phone: '1-800-273-8255',
            text: 'Text 838255',
            gradient: 'from-emerald-500 to-teal-500',
        },
    ];

    return (
        <div className="min-h-screen bg-[#FAFAFA] dark:bg-transparent">
            <div className="max-w-4xl mx-auto p-6 md:p-8 space-y-8">
                {/* Header */}
                <div className="animate-in">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-2">Crisis Support</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">Immediate help is available 24/7</p>
                </div>

                {/* Emergency Alert */}
                <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-red-500/30 animate-in">
                    <div className="flex items-start gap-4">
                        <AlertTriangle className="flex-shrink-0 mt-1" size={32} />
                        <div>
                            <h2 className="text-2xl font-bold mb-3">Emergency</h2>
                            <p className="text-white/90 mb-4 text-lg">
                                If you're in immediate danger, call <strong>911</strong> or go to your nearest emergency room.
                            </p>
                            <p className="text-white/90 text-lg">
                                If you're having thoughts of suicide, call <strong>988</strong> now.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Immediate Help */}
                <div className="bg-white dark:bg-white/5 rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-white/10 animate-in">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Immediate Help</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <a
                            href="tel:988"
                            className="flex items-center justify-center gap-3 bg-gradient-to-r from-red-500 to-orange-500 text-white py-4 px-6 rounded-2xl font-medium hover:shadow-lg hover:shadow-red-500/50 transition-all duration-200"
                        >
                            <Phone size={20} />
                            Call 988
                        </a>
                        <a
                            href="sms:988"
                            className="flex items-center justify-center gap-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 px-6 rounded-2xl font-medium hover:shadow-lg hover:shadow-orange-500/50 transition-all duration-200"
                        >
                            <MessageSquare size={20} />
                            Text 988
                        </a>
                    </div>
                </div>

                {/* All Resources */}
                <div className="bg-white dark:bg-white/5 rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-white/10 animate-in">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Crisis Resources</h2>
                    <div className="space-y-4">
                        {resources.map((resource, index) => (
                            <div key={index} className="border border-gray-200 dark:border-white/10 rounded-2xl p-6 hover:border-gray-300 dark:hover:border-white/20 transition-colors duration-200">
                                <div className="mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{resource.name}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{resource.description}</p>
                                    <span className="inline-block px-3 py-1 bg-green-100 dark:bg-green-500/10 text-green-800 dark:text-green-400 text-xs font-medium rounded-full">
                                        Available 24/7
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {resource.phone && (
                                        <a
                                            href={`tel:${resource.phone}`}
                                            className={`flex items-center gap-2 bg-gradient-to-r ${resource.gradient} text-white py-2.5 px-5 rounded-xl font-medium hover:shadow-lg transition-all duration-200`}
                                        >
                                            <Phone size={16} />
                                            {resource.phone}
                                        </a>
                                    )}
                                    {resource.text && (
                                        <a
                                            href={`sms:${resource.text.split(' ').pop()}`}
                                            className="flex items-center gap-2 bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-gray-100 py-2.5 px-5 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-white/20 transition-colors duration-200"
                                        >
                                            <MessageSquare size={16} />
                                            {resource.text}
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Crisis;

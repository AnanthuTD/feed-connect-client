export default function timeDifference(time_stamp: Date): string {
    const dateObj = new Date(time_stamp);
    const currentDate = new Date();

    const differenceYears =
        currentDate.getFullYear() - dateObj.getFullYear();
    
    if (differenceYears) return differenceYears + "y";

    const differenceMonths = currentDate.getMonth() - dateObj.getMonth();
    if (differenceMonths) return differenceMonths + "m";

    const differenceDays = currentDate.getDate() - dateObj.getDate();
    if (differenceDays) return differenceDays + "d";

    const differenceHours = currentDate.getHours() - dateObj.getHours();
    if (differenceHours) return differenceHours + "h";

    const differenceMins = currentDate.getMinutes() - dateObj.getMinutes();
    if (differenceMins) return differenceMins + "m";

    const differenceSecs = currentDate.getSeconds() - dateObj.getSeconds();
    return differenceSecs + "s";


}
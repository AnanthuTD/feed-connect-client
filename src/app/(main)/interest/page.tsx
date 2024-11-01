'use client'
import React, { useState, useEffect } from 'react';
import { Checkbox, Button, message, Typography, Row } from 'antd';
import axios from '@/lib/axios';

const InterestsForm: React.FC = () => {
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

    useEffect(() => {
        // Fetch user's interests from the backend
        axios.get('api/accounts/interests/')
            .then(response => {
                const interests = response.data.interests;
                setSelectedInterests(interests);
            })
            .catch(error => {
                message.error('Failed to fetch interests');
            });
    }, []);

    const handleInterestChange = (checkedValues: string[]) => {
        setSelectedInterests(checkedValues);
    };

    const handleSubmit = () => {
        if (selectedInterests.length === 0) {
            message.error('Please select at least one interest');
            return;
        }
        axios.post('api/accounts/interests/', { interests: selectedInterests })
            .then(response => {
                message.success('Interests updated successfully!');
            })
            .catch(error => {
                message.error('Failed to update interests');
            });
    };

    return (
        <div className='w-full h-full flex justify-center items-center'>
            <div>
                <Typography.Title level={3}> Select Your Interest </Typography.Title>
                <Row>
                    <Checkbox.Group onChange={handleInterestChange} value={selectedInterests}>
                        <Checkbox value="sports">Sports</Checkbox>
                        <Checkbox value="music">Music</Checkbox>
                        <Checkbox value="movies">Movies</Checkbox>
                        <Checkbox value="technology">Technology</Checkbox>
                        <Checkbox value="cooking">Cooking</Checkbox>
                        <Checkbox value="travel">Travel</Checkbox>
                        <Checkbox value="art">Art</Checkbox>
                        {/* Add more options as needed */}
                    </Checkbox.Group>
                </Row>
                <Row>
                    <Button type="primary" style={{ marginTop: '10px' }} onClick={handleSubmit}>
                        Save Interest
                    </Button>
                </Row>
            </div>
        </div>
    );
};

export default InterestsForm;
